// src/pages/DesignReview.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Palette, Info, Image, MessageSquare, Copy,
  CheckCircle, Send, Bot, Lightbulb, GanttChart, Scale, X, FileText, ScrollText, Check, File as FileIcon, Download
} from 'lucide-react';

import axiosInstance from '../api/axiosInstance';
import { submitReview, getReviewDetail, createOpinionNotice, getOpinionNotices } from '../api/review';
import {
  startChatSession,
  sendChatMessageToServer,
  validatePatentDocument,
  generateRejectionDraft,
  searchDesignImageByBlob
} from '../api/ai';

// 파일 API
import { getImageUrlsByIds, getNonImageFilesByIds, toAbsoluteFileUrl } from '../api/files';

/* ------------------------- 유틸 & 보조 컴포넌트 ------------------------- */

// 안전 UUID
const safeUUID = () => {
  try {
    if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
    const rnd = Math.random().toString(36).slice(2);
    return `id-${Date.now().toString(36)}-${rnd}`;
  } catch {
    return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  }
};

// 문자열/JSON배열/콤마/개행/단일 URL 모두 파싱
function extractDrawingUrls(raw) {
  if (!raw) return [];
  const isUrl = (s) => /^(https?:\/\/|\/|data:image\/)/i.test((s || '').trim());
  try {
    const j = JSON.parse(raw);
    if (Array.isArray(j)) return j.map(String).filter(isUrl);
  } catch {
    /* empty */
  }
  const candidates = String(raw).split(/[\s,;\n\r]+/).map(s => s.trim()).filter(Boolean);
  const urls = candidates.filter(isUrl);
  if (urls.length) return urls;
  if (isUrl(raw)) return [String(raw).trim()];
  return [];
}

// /api/files → 실패 시 /files 폴백
function SmartImage({ source, className, alt }) {
  const [idx, setIdx] = React.useState(0);
  const sources = React.useMemo(() => {
    if (typeof source === 'string') return [source];
    if (source && source.patentId && source.fileName) {
      const enc = encodeURIComponent(source.fileName);
      const a = `/api/files/${source.patentId}/${enc}`;
      const b = `/files/${source.patentId}/${enc}`;
      return [a, b];
    }
    return [];
  }, [source]);
  if (sources.length === 0) {
    return (
      <div className="w-full h-32 bg-gray-50 border border-gray-200 flex items-center justify-center text-xs text-gray-500">
        이미지 없음
      </div>
    );
  }
  return (
    <img
      alt={alt}
      src={sources[idx]}
      className={className}
      onError={(e) => {
        if (idx < sources.length - 1) setIdx(idx + 1);
        else {
          e.currentTarget.onerror = null;
          e.currentTarget.src = 'https://placehold.co/400x300/e2e8f0/94a3b8?text=Image+Not+Found';
        }
      }}
    />
  );
}

// 디자인 객체에서 도면 소스 구성
function buildDesignDrawingSources(d) {
  if (!d) return [];
  const list = [];
  list.push(...extractDrawingUrls(d.drawingDescription));
  if (Array.isArray(d.drawings) && d.drawings.length > 0) {
    list.push(...d.drawings.map((s) => typeof s === 'string' ? toAbsoluteFileUrl(s) : s));
  }
  if (d.drawingImageUrl) list.push(toAbsoluteFileUrl(d.drawingImageUrl));
  if (Array.isArray(d.drawingFileNames) && d.drawingFileNames.length > 0) {
    list.push(...d.drawingFileNames.map(fn => ({ patentId: d.patentId, fileName: fn })));
  }
  const seen = new Set();
  const out = [];
  for (const it of list) {
    if (typeof it === 'string') {
      const abs = toAbsoluteFileUrl(it);
      if (!seen.has(abs)) { seen.add(abs); out.push(abs); }
    } else {
      out.push(it);
    }
  }
  return out;
}

// srcLike → URL
function resolveToUrl(srcLike) {
  if (typeof srcLike === 'string') return toAbsoluteFileUrl(srcLike);
  if (srcLike && srcLike.patentId && srcLike.fileName) {
    const encoded = encodeURIComponent(srcLike.fileName);
    return `/api/files/${srcLike.patentId}/${encoded}`;
  }
  return null;
}

// 파일명에서 UUID 프리픽스 제거
function cleanFileName(name = '') {
  const decoded = decodeURIComponent(name);
  return decoded.replace(/^[0-9a-fA-F-]{36}_/, '');
}

// 3D 뷰어
function ModelViewer3D({ src }) {
  useEffect(() => {
    if (!window.customElements || !window.customElements.get('model-viewer')) {
      const script = document.createElement('script');
      script.type = 'module';
      script.src = 'https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js';
      document.head.appendChild(script);
    }
  }, []);
  return (
    <div className="w-full h-72 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 flex items-center justify-center">
      {/* @ts-ignore */}
      <model-viewer
        style={{ width: '100%', height: '100%' }}
        src={src}
        camera-controls
        auto-rotate
        exposure="1.0"
        shadow-intensity="1"
        ar
      />
    </div>
  );
}

// 로그인 유저 ID
const getCurrentUserId = () => {
  try {
    const rawUser = localStorage.getItem('user') || localStorage.getItem('auth') || null;
    if (rawUser) {
      const parsed = JSON.parse(rawUser);
      return parsed.userId || parsed.user_id || parsed.id || null;
    }
    return localStorage.getItem('userId') || localStorage.getItem('user_id') || null;
  } catch {
    return localStorage.getItem('userId') || localStorage.getItem('user_id') || null;
  }
};

// 255자 보호용 코멘트 빌더
function buildSubmitComment(kind, ids = []) {
  const base = `${kind} 저장됨`;
  if (!ids.length) return base;
  const joined = ids.join(', ');
  const full = `${base}: ${joined}`;
  if (full.length <= 255) return full;
  return `${base} (${ids.length}건)`; // 255 넘으면 개수만 남김
}

// 클립보드 복사
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

// 텍스트 다운로드
function downloadTextFile(filename, text) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/* -------------------------------- 컴포넌트 -------------------------------- */

export default function DesignReview() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [design, setDesign] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedAction, setSelectedAction] = useState('document');
  const [approvalComment, setApprovalComment] = useState('');
  const [rejectionComment, setRejectionComment] = useState('');
  const [status, setStatus] = useState('심사대기');
  const [approvalDocumentText, setApprovalDocumentText] = useState('');

  // 의견서 목록
  const [notices, setNotices] = useState([]);
  const [noticesLoading, setNoticesLoading] = useState(false);
  const [expandedNoticeIds, setExpandedNoticeIds] = useState(() => new Set());

  // 챗봇
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatSessionId, setChatSessionId] = useState(null);

  // 모달
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  // AI 상태
  const [similarityResults, setSimilarityResults] = useState([]);
  const [isSearchingSimilarity, setIsSearchingSimilarity] = useState(false);

  // 첨부 이미지/비이미지
  const [attachmentImageUrls, setAttachmentImageUrls] = useState([]);
  const [attachmentOtherFiles, setAttachmentOtherFiles] = useState([]);

  // glb 뷰어 소스
  const [glbModelUrl, setGlbModelUrl] = useState('');

  // 도면 소스
  const drawingSources = useMemo(() => {
    const fromDesign = buildDesignDrawingSources(design);
    const merged = [...attachmentImageUrls, ...fromDesign];
    const seen = new Set();
    return merged.filter((v) => {
      const k = typeof v === 'string' ? v : `${v.patentId}/${v.fileName}`;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  }, [design, attachmentImageUrls]);

  const contextImageUrls = useMemo(
    () => drawingSources.map(resolveToUrl).filter(Boolean),
    [drawingSources]
  );
  const [selectedDrawingIdx, setSelectedDrawingIdx] = useState(0);
  useEffect(() => { setSelectedDrawingIdx(0); }, [drawingSources.length]);

  const showMessageBox = (message) => { setModalMessage(message); setShowModal(true); };

  // 의견서(긴 본문) 저장: 분할 + 메타
// 긴 본문을 opinion-notice에 저장(분할 저장). type 포함(필수).
// 의견서(긴 본문) 저장: 분할 + 메타 + type 필수
  async function saveLongOpinion(reviewId, kind, content, { isAiDrafted = false } = {}) {
    const text = String(content || '').trim();
    if (!reviewId || !text) return [];

    const typeMap = {
      '최종 승인 의견서': 'APPROVAL',
      '보류 의견서': 'EXAMINER_OPINION',
      '거절 사유서': 'REJECTION',
    };
    const type = typeMap[kind] || 'EXAMINER_OPINION';

    const CHUNK = 8000;           // 안전 분할
    const ts = new Date().toISOString().slice(0,16).replace('T',' ');
    const total = Math.ceil(text.length / CHUNK) || 1;
    const ids = [];

    const postPart = async (partIdx, chunk) => {
      const structured = { kind, ts, totalParts: total, part: partIdx, source: 'design-review-ui' };
      const res = await createOpinionNotice(reviewId, {
        content: chunk,
        type,
        status: 'SUBMITTED',
        structured_content: JSON.stringify(structured),
        isAiDrafted,
      });
      const id = res?.id ?? res?.noticeId ?? res?.opinionNoticeId;
      if (id != null) ids.push(id);
    };

    if (text.length <= CHUNK) {
      await postPart(1, text);
    } else {
      let part = 1;
      for (let i = 0; i < text.length; i += CHUNK, part++) {
        await postPart(part, text.slice(i, i + CHUNK));
      }
    }
    return ids;
  }



  // 의견서 목록 불러오기
  const refreshNotices = async (reviewId) => {
    if (!reviewId) return;
    setNoticesLoading(true);
    try {
      const rows = await getOpinionNotices(reviewId);
      setNotices(Array.isArray(rows) ? rows : []);
    } catch (e) {
      console.warn('의견서 목록 조회 실패:', e);
      setNotices([]);
    } finally {
      setNoticesLoading(false);
    }
  };

  // 리뷰 상세 + 첨부 + 의견서 목록
  useEffect(() => {
    const run = async () => {
      if (!id) return;
      setLoading(true);
      try {
        // 1) 리뷰 상세
        const data = await getReviewDetail(id);
        setDesign(data);

        // 2) 상태 매핑
        let translatedStatus = '';
        switch (data.decision) {
          case 'APPROVE':
          case 'APPROVED':
            translatedStatus = '심사완료';
            setSelectedAction('approval');
            setApprovalDocumentText(data.comment || '최종 등록 승인됨.');
            break;
          case 'REJECT':
          case 'REJECTED':
            translatedStatus = '거절';
            setSelectedAction('rejection');
            setRejectionComment(data.comment || '');
            break;
          case 'REVIEWING':
            translatedStatus = '심사중';
            if (data.comment) setApprovalComment(data.comment);
            break;
          case 'SUBMITTED':
          default:
            translatedStatus = '심사대기';
            break;
        }
        setStatus(translatedStatus);

        // 3) 첨부 파일
        let attachmentIds = Array.isArray(data.attachmentIds) ? data.attachmentIds : [];
        if ((!attachmentIds || attachmentIds.length === 0) && data.patentId) {
          const { data: detail } = await axiosInstance.get(`/api/patents/${data.patentId}`).catch(() => ({ data: null }));
          if (detail && Array.isArray(detail.attachmentIds)) {
            attachmentIds = detail.attachmentIds;
            if (Array.isArray(detail.drawingFileNames)) {
              setDesign(prev => prev ? { ...prev, drawingFileNames: detail.drawingFileNames } : prev);
            }
          }
        }
        if (attachmentIds && attachmentIds.length > 0) {
          try {
            const [images, others] = await Promise.all([
              getImageUrlsByIds(attachmentIds),
              getNonImageFilesByIds(attachmentIds)
            ]);
            setAttachmentImageUrls(images);
            setAttachmentOtherFiles(others);
            const glb = others.find(f => /\.glb($|\?|#)/i.test(f?.name || '') || /\.glb($|\?|#)/i.test(f?.url || ''));
            setGlbModelUrl(glb ? glb.url : '');
          } catch {
            setAttachmentImageUrls([]); setAttachmentOtherFiles([]); setGlbModelUrl('');
          }
        } else {
          setAttachmentImageUrls([]); setAttachmentOtherFiles([]); setGlbModelUrl('');
        }

        // 4) 의견서 목록
        const reviewId = data?.reviewId ?? data?.review_id ?? Number(id);
        await refreshNotices(reviewId);

      } catch (error) {
        console.error('심사 상세 정보 조회 실패:', error);
        showMessageBox('심사 정보를 불러오는 데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [id, navigate]);

  // 자동 유사 분석
  useEffect(() => {
    (async () => {
      if (!design) return;
      if (!drawingSources || drawingSources.length === 0) return;
      const first = drawingSources[0];
      const url = resolveToUrl(first);
      if (!url) return;
      try {
        setIsSearchingSimilarity(true);
        const results = await searchDesignImageByBlob(url);
        if (results && results.results) setSimilarityResults(results.results);
        else setSimilarityResults([]);
      } catch (e) {
        console.warn('자동 유사 분석 실패:', e);
        setSimilarityResults([]);
      } finally {
        setIsSearchingSimilarity(false);
      }
    })();
  }, [design, drawingSources]);

  const sendChatMessage = async (message = inputMessage) => {
    if (!message.trim() || !design || !design.patentId) {
      const errorMessage = {
        id: safeUUID(),
        type: 'bot',
        message: '오류: 디자인 정보가 올바르지 않아 AI와 대화를 시작할 수 없습니다.',
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errorMessage]);
      return;
    }

    const newUserMessage = { id: safeUUID(), type: 'user', message, timestamp: new Date() };
    setChatMessages(prev => [...prev, newUserMessage]);
    setInputMessage(''); setIsTyping(true);

    const messagePayload = { message, context: { image_urls: contextImageUrls } };

    try {
      let currentSessionId = chatSessionId;
      if (!currentSessionId) {
        const userId = getCurrentUserId();
        const sessionResponse = await startChatSession(design.patentId, userId);
        const sid = sessionResponse?.session_id || sessionResponse?.id;
        if (!sid) throw new Error('Failed to get a valid session_id from the server.');
        currentSessionId = sid;
        setChatSessionId(currentSessionId);
      }

      const botResponse = await sendChatMessageToServer(currentSessionId, messagePayload);
      const botMessage = {
        id: botResponse?.message_id || safeUUID(),
        type: 'bot',
        message: botResponse?.content ?? '응답이 비어 있습니다.',
        timestamp: botResponse?.created_at ? new Date(botResponse.created_at) : new Date()
      };
      setChatMessages(prev => [...prev, botMessage]);

      if (botResponse?.executed_features?.length > 0) {
        const featuresMessage = {
          id: safeUUID(),
          type: 'bot-features',
          features: botResponse.executed_features,
          results: botResponse.features_result,
          timestamp: new Date()
        };
        setChatMessages(prev => [...prev, featuresMessage]);
      }
    } catch (error) {
      console.error('챗봇 메시지 전송 실패:', error);
      const errorMessage = {
        id: safeUUID(),
        type: 'bot',
        message: error.message === 'Failed to get a valid session_id from the server.'
          ? '오류: AI와 새로운 대화 세션을 시작하지 못했습니다. 서버 응답을 확인해주세요.'
          : '죄송합니다. AI 도우미와 연결하는 데 문제가 발생했습니다.',
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickQuestion = (query) => sendChatMessage(query);

  const getStatusColorClass = (currentStatus) => {
    switch (currentStatus) {
      case '심사완료':
      case '등록결정': return 'bg-green-100 text-green-700';
      case '심사대기': return 'bg-blue-100 text-blue-800';
      case '심사중': return 'bg-yellow-100 text-yellow-800';
      case '거절': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // 저장 + 상태변경 (보류/거절)
  const handleReviewSubmit = async () => {
    let docText, decision, msg, newStatus, kind;

    if (selectedAction === 'document') {
      docText   = approvalComment;
      decision  = 'REVIEWING';
      newStatus = '심사중';
      msg       = '의견서가 제출되었습니다. 상태가 "심사중"으로 변경됩니다.';
      kind      = '보류 의견서';
    } else if (selectedAction === 'rejection') {
      docText   = rejectionComment;
      decision  = 'REJECT';
      newStatus = '거절';
      msg       = '거절사유서가 제출되었습니다. 상태가 "거절"으로 변경됩니다.';
      kind      = '거절 사유서';
    } else {
      return;
    }

    if (!docText || !docText.trim()) {
      showMessageBox('의견을 입력해주세요.');
      return;
    }

    try {
      const reviewId = design?.reviewId ?? design?.review_id ?? Number(id);

      // 1) 긴 본문 저장 (분할 포함)
      const noticeIds = await saveLongOpinion(reviewId, kind, docText);

      // 2) 짧은 코멘트로 상태변경 (255자 보호)
      const ref = buildSubmitComment(kind, noticeIds);
      await submitReview({
        patentId: design.patentId,
        decision,
        comment: ref,
      });

      // 3) 목록 리프레시
      await refreshNotices(reviewId);

      setStatus(newStatus);
      showMessageBox(msg);
    } catch (error) {
      console.error('심사 제출 실패:', error);
      showMessageBox('심사 제출에 실패했습니다. 다시 시도해 주세요.');
    }
  };

  // 최종 승인용 템플릿
  const prepareFinalApproval = () => {
    setSelectedAction('approval');
    const documentText = `
[디자인 등록 결정 의견서]

출원번호: ${design.applicationNumber}
디자인명: ${design.title || design.patentTitle}
출원인: ${design.applicantName}
심사관: ${design.examinerName}
--------------------------------------------------

귀하의 디자인 출원 ${design.applicationNumber}에 대하여 심사한 결과, 본 출원은 디자인보호법 관련 규정에 의거하여 다음과 같은 사유로 등록이 결정되었음을 통지합니다.

1. 신규성 및 창작성:
 - 본 디자인의 핵심적인 '${design.summary}'은(는) 기존에 공지된 디자인과 명확히 구별되는 독창적인 심미감을 포함하고 있습니다.
 - 기존 디자인이 해결하지 못했던 특정 문제점을 효과적으로 해결하여 창작성이 높다고 인정됩니다.

2. 산업상 이용 가능성:
 - 본 디자인은 관련 산업 분야에서 양산 가능하며, 시장에 긍정적인 영향을 줄 것으로 기대됩니다.

3. 기재 요건 충족 여부:
 - 출원서의 도면 및 설명은 명확하고 구체적으로 기재되어 있어, 디자인의 기술적 사상을 충분히 이해할 수 있습니다.

따라서, 본 디자인은 등록 요건을 모두 충족하므로 등록을 결정합니다.

${new Date().getFullYear()}년 ${new Date().getMonth() + 1}월 ${new Date().getDate()}일

대한민국 특허청
심사관 ${design.examinerName}
    `;
    setApprovalDocumentText(documentText.trim());
  };

  // 최종 승인 처리
  const handleFinalizeApproval = async () => {
    try {
      const reviewId = design?.reviewId ?? design?.review_id ?? Number(id);

      // 1) 긴 본문 저장
      const noticeIds = await saveLongOpinion(reviewId, '최종 승인 의견서', approvalDocumentText);

      // 2) 짧은 코멘트로 상태변경
      const ref = buildSubmitComment('의견서', noticeIds);
      await submitReview({
        patentId: design.patentId,
        decision: 'APPROVE',
        comment: ref,
      });

      // 3) 목록 리프레시
      await refreshNotices(reviewId);

      setStatus('심사완료');
      showMessageBox('디자인이 최종 승인 처리되었습니다.');
    } catch (error) {
      console.error('최종 승인 실패:', error);
      showMessageBox('최종 승인 처리에 실패했습니다.');
    }
  };

  // 서류 점검
// 서류 점검
  const handleDocumentCheck = async () => {
    if (!design) return;

    // 🔵 결과 나오기 전, 모달에 로딩 문구 먼저 표시
    showMessageBox('오류 점검 중…');

    try {
      const results = await validatePatentDocument(design.patentId);

      // ✅ 응답 정규화
      const flat = [];
      if (Array.isArray(results)) {
        flat.push(...results);
      } else if (results && typeof results === 'object') {
        const { formatErrors, contextualErrors, missingSections } = results;

        if (Array.isArray(formatErrors)) {
          flat.push(...formatErrors.map(e => ({
            type: 'FORMAT',
            field: e.field,
            message: e.message,
            id: e.id,
          })));
        }
        if (Array.isArray(contextualErrors)) {
          flat.push(...contextualErrors.map(e => ({
            type: 'CONTEXT',
            field: e.field,
            claim: e.claim,
            claimIndex: e.claimIndex,
            message: e.analysis || e.message,
            id: e.id,
          })));
        }
        if (Array.isArray(missingSections)) {
          flat.push(...missingSections.map(e => ({
            type: 'MISSING',
            field: e.field,
            message: e.message,
            id: e.id,
          })));
        }
      }

      // 🔵 같은 모달에 결과로 교체
      if (flat.length > 0) {
        const pretty = flat.map((e, i) => {
          const where =
            e.claim ? ` (${e.claim}${typeof e.claimIndex === 'number' ? `#${e.claimIndex + 1}` : ''})` :
            e.field ? ` [${e.field}]` : '';
          const tag =
            e.type === 'FORMAT'  ? '형식오류' :
            e.type === 'CONTEXT' ? '맥락오류' :
            e.type === 'MISSING' ? '누락섹션' : (e.type || '오류');
          return `${i + 1}. [${tag}]${where} ${e.message}`;
        }).join('\n');
        showMessageBox(`점검 결과 ❗\n\n${pretty}`);
      } else {
        showMessageBox('점검 완료 ✨\n\n서류에서 특별한 오류가 발견되지 않았습니다.');
      }
    } catch (error) {
      console.error('출원 서류 점검 실패:', error);
      showMessageBox('오류: 서류 점검 중 문제가 발생했습니다.');
    }
  };


  // 의견서 그룹화(Part 통합)
  const groupedNotices = useMemo(() => {
    if (!Array.isArray(notices)) return [];

    const norm = (n) => {
      const id = n?.noticeId ?? n?.id;
      const content = n?.content ?? '';
      const type = n?.type ?? 'EXAMINER_OPINION';
      const status = n?.status ?? 'SUBMITTED';
      const createdAt = n?.created_at ?? n?.createdAt ?? null;
      let structured = n?.structured_content ?? n?.structuredContent ?? null;
      if (structured && typeof structured === 'string') {
        try { structured = JSON.parse(structured); } catch { /* ignore */ }
      }
      const isAiDrafted = n?.is_ai_drafted ?? n?.isAiDrafted ?? false;
      return { id, content, type, status, createdAt, structured, isAiDrafted };
    };

    const byGroup = new Map();

    notices.forEach((raw) => {
      const n = norm(raw);
      // 그룹 키 결정
      let key = `single-${n.id}`;
      if (n.structured && n.structured.kind && n.structured.ts) {
        key = `grp-${n.structured.kind}|${n.structured.ts}`;
      }
      const arr = byGroup.get(key) || [];
      arr.push(n);
      byGroup.set(key, arr);
    });

    // Part 정렬 + 병합
    const out = [];
    for (const [key, arr] of byGroup.entries()) {
      // 정렬 기준: structured.part → createdAt → id
      arr.sort((a, b) => {
        const pa = a.structured?.part ?? 0;
        const pb = b.structured?.part ?? 0;
        if (pa !== pb) return pa - pb;
        const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        if (da !== db) return da - db;
        return (a.id ?? 0) - (b.id ?? 0);
      });
      const combinedText = arr.map(x => x.content || '').join('\n');
      const meta = arr[0] || {};
      const parts = arr.length;
      out.push({
        groupKey: key,
        ids: arr.map(x => x.id),
        type: meta.type,
        status: meta.status,
        createdAt: meta.createdAt,
        isAiDrafted: arr.some(x => x.isAiDrafted),
        parts,
        content: combinedText,
        title: meta.structured?.kind || (meta.type === 'APPROVAL' ? '최종 승인 의견서' :
                meta.type === 'REJECTION' ? '거절 사유서' : '보류 의견서'),
      });
    }
    // 최신순 정렬
    out.sort((a, b) => {
      const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return db - da;
    });
    return out;
  }, [notices]);

  const toggleExpand = (groupKey) => {
    setExpandedNoticeIds(prev => {
      const next = new Set(prev);
      if (next.has(groupKey)) next.delete(groupKey);
      else next.add(groupKey);
      return next;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-indigo-500 rounded-full animate-bounce"></div>
          <div className="w-4 h-4 bg-purple-500 rounded-full animate-bounce delay-150"></div>
          <div className="w-4 h-4 bg-indigo-500 rounded-full animate-bounce delay-300"></div>
          <p className="ml-4 text-gray-700 font-medium">데이터를 불러오는 중입니다...</p>
        </div>
      </div>
    );
  }

  if (!design) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-gray-700 font-medium">심사 정보를 찾을 수 없습니다.</p>
      </div>
    );
  }

  const isFinalStatus = status === '심사완료' || status === '거절';

  return (
    <div className="bg-gradient-to-br from-slate-50 via-gray-50 to-gray-50 min-h-screen relative font-sans">
      <main className={`transition-all duration-300 ease-in-out ${isChatOpen ? 'mr-[450px]' : 'mr-0'}`}>
        <div className="bg-white shadow-sm border-b">
          <div className="px-8 py-4 flex justify-between items-center">
            <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-800">
              <Palette className="w-7 h-7 text-indigo-600" />
              <span>디자인 심사 시스템</span>
            </h2>
            <button
              onClick={() => setIsChatOpen(!isChatOpen)}
              className={`fixed right-8 bottom-8 z-50 p-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 ${
                isChatOpen ? 'translate-x-[-420px]' : 'translate-x-0'
              }`}
            >
              <Bot className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-8 font-sans">
          {/* 출원 정보 */}
          <section className="mb-6 border border-gray-200 p-6 rounded-xl bg-white shadow-sm">
            <h3 className="font-semibold text-xl mb-4 text-gray-800 flex items-center gap-2">
              <Info className="w-5 h-5 text-indigo-500" /> 출원 정보
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-3 text-gray-700">
              <p><strong>출원번호:</strong> <span className="font-medium text-gray-900">{design.applicationNumber}</span></p>
              <p><strong>접수일자:</strong> <span className="font-medium text-gray-900">{design.applicationDate}</span></p>
              <p><strong>출원인:</strong> <span className="font-medium text-gray-900">{design.applicantName || '정보 없음'}</span></p>
              <p><strong>디자인명:</strong> <span className="font-medium text-gray-900">{design.title || design.patentTitle}</span></p>
              <p>
                <strong>심사상태:</strong>
                <span className={`font-semibold ${getStatusColorClass(status)} px-2 py-1 rounded text-sm ml-2`}>{status}</span>
              </p>
              <p><strong>분류:</strong> <span className="font-medium text-gray-900">{design.technicalField}</span></p>
              <p><strong>담당 심사관:</strong> <span className="font-medium text-gray-900">{design.examinerName || '정보 없음'}</span></p>
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* 심사 의견서 작성 */}
            <section className={`border border-gray-200 p-5 rounded-xl bg-white shadow-sm ${isFinalStatus ? 'opacity-60 bg-gray-50' : ''}`}>
              <h3 className="font-semibold text-xl mb-4 text-gray-800 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-indigo-500" /> 심사 의견서 작성
              </h3>

              <div className="flex gap-1 p-1 bg-gray-50 rounded-xl mb-6 border border-gray-200">
                <button
                  onClick={() => setSelectedAction('document')}
                  disabled={isFinalStatus}
                  className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                    selectedAction === 'document'
                      ? 'bg-gradient-to-r from-yellow-500 to-amber-600 text-white shadow-md transform scale-[1.02]'
                      : 'text-yellow-700 bg-yellow-50 hover:bg-yellow-100'
                  }`}
                >📝 보류 의견서</button>
                <button
                  onClick={() => setSelectedAction('rejection')}
                  disabled={isFinalStatus}
                  className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                    selectedAction === 'rejection'
                      ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-md transform scale-[1.02]'
                      : 'text-red-700 bg-red-50 hover:bg-red-100'
                  }`}
                >✗ 거절 사유서</button>
                <button
                  onClick={prepareFinalApproval}
                  disabled={isFinalStatus}
                  className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                    selectedAction === 'approval'
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 shadow-md'
                      : 'text-blue-700 bg-blue-50 hover:bg-blue-100'
                  }`}
                >⚡ 최종 승인</button>
              </div>

              {(selectedAction === 'document' || selectedAction === 'rejection' || selectedAction === 'approval') && (
                <div className="mb-4 w-full">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      {selectedAction === 'document' ? '보류 의견서 작성' : selectedAction === 'rejection' ? '거절 사유서 작성' : '최종 승인 서류'}
                    </label>
                    {selectedAction === 'rejection' && (
                      <button
                        onClick={async () => {
                          try {
                            const draft = await generateRejectionDraft(design.patentId);
                            setRejectionComment(draft.content);
                            showMessageBox('AI 거절 사유서 초안이 생성되었습니다.');
                          } catch {
                            showMessageBox('오류: AI 초안 생성에 실패했습니다.');
                          }
                        }}
                        disabled={isFinalStatus}
                        className="px-3 py-1.5 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-md hover:bg-indigo-200 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Bot className="w-4 h-4 mr-1.5" />
                        AI 초안 생성
                      </button>
                    )}
                  </div>
                  <textarea
                    rows={16}
                    disabled={isFinalStatus}
                    className="w-full border border-gray-300 px-4 py-3 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-y disabled:bg-gray-100"
                    placeholder={
                      selectedAction === 'document' ? '보류 사유 및 보완이 필요한 사항에 대해 작성해주세요.' :
                      selectedAction === 'rejection' ? '거절 이유를 구체적으로 작성해주세요.' : ''
                    }
                    value={
                      selectedAction === 'document' ? approvalComment :
                      selectedAction === 'rejection' ? rejectionComment :
                      approvalDocumentText
                    }
                    onChange={(e) => {
                      if (selectedAction === 'document') setApprovalComment(e.target.value);
                      else if (selectedAction === 'rejection') setRejectionComment(e.target.value);
                      else setApprovalDocumentText(e.target.value);
                    }}
                  />
                  <div className="flex justify-end w-full mt-4">
                    {selectedAction === 'document' || selectedAction === 'rejection' ? (
                      <button
                        onClick={handleReviewSubmit}
                        disabled={isFinalStatus}
                        className={`px-5 py-2 text-white rounded-lg font-medium flex items-center gap-2 transition-all disabled:bg-gray-400 ${
                          selectedAction === 'document'
                            ? 'bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700'
                            : 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700'
                        }`}
                      >
                        <Send className="w-4 h-4" />
                        {selectedAction === 'document' ? '의견서 제출' : '사유서 제출'}
                      </button>
                    ) : (
                      <button
                        onClick={handleFinalizeApproval}
                        disabled={isFinalStatus}
                        className="px-5 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors disabled:bg-gray-400"
                      >
                        <Check className="w-4 h-4" />
                        최종 승인
                      </button>
                    )}
                  </div>
                </div>
              )}
            </section>

            {/* 심사 대상 */}
            <section className="border border-gray-200 p-6 rounded-xl bg-white shadow-sm">
              <h3 className="font-semibold text-xl mb-4 flex items-center gap-2 text-gray-800">
                <FileText className="w-5 h-5 text-indigo-500" /> 심사 대상
                <button
                  onClick={handleDocumentCheck}
                  className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium ml-auto transition-colors flex items-center gap-2 text-sm"
                >
                  <ScrollText className="w-4 h-4" />
                  AI 서류 점검
                </button>
              </h3>

              {/* 청구항 */}
              <div className="mb-4">
                <h4 className="font-medium text-lg mb-2 text-gray-800 flex items-center gap-1">
                  <FileText className="w-4 h-4 text-indigo-400" /> 청구항
                </h4>
                {design.claims && design.claims.length > 0 ? (
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 bg-gray-50 p-3 rounded-md border border-gray-100 max-h-32 overflow-y-auto">
                    {design.claims.map((claim, index) => (
                      <li key={index}>{claim}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-600 col-span-full text-sm bg-gray-50 p-3 rounded-md border border-gray-100">
                    등록된 청구항이 없습니다.
                  </p>
                )}
              </div>

              {/* 요약 */}
              <div className="mb-4">
                <h4 className="font-medium text-lg mb-2 text-gray-800 flex items-center gap-1">
                  <FileText className="w-4 h-4 text-indigo-400" /> 요약
                </h4>
                <div className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-md border border-gray-100 max-h-32 overflow-y-auto">
                  {design.summary || '요약 정보가 없습니다.'}
                </div>
              </div>

              {/* 2D 도면 */}
              <div className="flex flex-col lg:flex-row gap-6 mb-4">
                <div className="flex-1 w-full">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-lg text-gray-800 flex items-center gap-1">
                      <Image className="w-4 h-4 text-indigo-400" /> 2D 도면
                    </h4>
                    {drawingSources.length > 0 && (
                      <span className="text-xs text-gray-500">
                        선택된 도면: <b>{selectedDrawingIdx + 1}</b> / {drawingSources.length}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                    {drawingSources.length > 0 ? (
                      drawingSources.map((srcLike, i) => {
                        const active = selectedDrawingIdx === i;
                        const displayName =
                          typeof srcLike === 'string'
                            ? cleanFileName(srcLike.split('/').pop().split('?')[0])
                            : cleanFileName(srcLike.fileName);
                        return (
                          <button
                            type="button"
                            key={i}
                            onClick={() => setSelectedDrawingIdx(i)}
                            className={`relative border rounded-md overflow-hidden bg-white text-left transition-all focus:outline-none ${
                              active ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-gray-200 hover:ring-1 hover:ring-gray-300'
                            }`}
                            title={displayName}
                          >
                            <SmartImage source={srcLike} alt={`도면 ${i + 1}`} className="w-full h-32 object-contain bg-white" />
                            {active && (
                              <span className="absolute top-2 right-2 text-[10px] px-2 py-0.5 rounded-full bg-indigo-600 text-white">
                                선택됨
                              </span>
                            )}
                            <div className="p-2 text-[11px] text-gray-600 truncate">{displayName}</div>
                          </button>
                        );
                      })
                    ) : (
                      <p className="text-gray-600 col-span-full text-sm bg-gray-50 p-3 rounded-md border border-gray-100">
                        등록된 2D 도면이 없습니다.
                      </p>
                    )}
                  </div>

                  {/* 이미지가 없고 비이미지 첨부가 있을 때 */}
                  {drawingSources.length === 0 && attachmentOtherFiles.length > 0 && (
                    <div className="mt-3 bg-gray-50 border border-gray-200 rounded-lg p-3">
                      <p className="text-sm font-medium text-gray-800 mb-2 flex items-center gap-2">
                        <FileIcon className="w-4 h-4 text-gray-600" />
                        이미지가 아닌 첨부 파일
                      </p>
                      <ul className="text-sm text-gray-700 space-y-1 max-h-32 overflow-y-auto">
                        {attachmentOtherFiles.map(f => (
                          <li key={f.id} className="flex items-center justify-between gap-2">
                            <span className="truncate">{f.name}</span>
                            <a
                              href={f.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-indigo-600 hover:underline text-xs flex-shrink-0"
                            >
                              열기
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* 3D 도면 */}
              <div className="mt-6">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium text-lg text-gray-800 flex items-center gap-1">
                    <Image className="w-4 h-4 text-indigo-400" /> 3D 도면
                  </h4>
                </div>
                {glbModelUrl ? (
                  <ModelViewer3D src={glbModelUrl} />
                ) : (
                  <div className="w-full h-24 bg-gray-50 border border-dashed border-gray-300 rounded-lg flex items-center justify-center text-sm text-gray-500">
                    첨부 파일에서 .glb 파일을 찾지 못했습니다. .glb 파일을 업로드하면 자동으로 표시됩니다.
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* 제출된 의견서/사유서 목록 */}
          <section className="mb-6 border border-gray-200 p-6 rounded-xl bg-white shadow-sm">
            <h3 className="font-semibold text-xl mb-4 text-gray-800 flex items-center gap-2">
              <ScrollText className="w-5 h-5 text-indigo-500" /> 제출된 의견서 / 사유서
            </h3>

            {noticesLoading ? (
              <div className="w-full flex justify-center items-center py-8">
                <div className="w-8 h-8 border-4 border-gray-200 border-t-indigo-500 rounded-full animate-spin"></div>
                <p className="ml-4 text-gray-600">의견서를 불러오는 중입니다...</p>
              </div>
            ) : groupedNotices.length === 0 ? (
              <p className="text-gray-600">제출된 의견서가 없습니다.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {groupedNotices.map(item => {
                  const expanded = expandedNoticeIds.has(item.groupKey);
                  const badgeColor =
                    item.type === 'APPROVAL' ? 'bg-blue-100 text-blue-700' :
                    item.type === 'REJECTION' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-800';
                  return (
                    <div key={item.groupKey} className="border border-gray-200 rounded-lg shadow-sm bg-white p-4 flex flex-col">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${badgeColor}`}>
                            {item.title}
                          </span>
                          {item.parts > 1 && (
                            <span className="text-[11px] text-gray-500">Part x {item.parts}</span>
                          )}
                          {item.isAiDrafted && (
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">AI</span>
                          )}
                        </div>
                        <div className="text-[11px] text-gray-500">
                          {item.createdAt ? new Date(item.createdAt).toLocaleString() : ''}
                        </div>
                      </div>

                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={() => toggleExpand(item.groupKey)}
                          className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded-md border border-gray-200"
                        >
                          {expanded ? '내용 닫기' : '내용 보기'}
                        </button>
                        <button
                          onClick={async () => {
                            const ok = await copyToClipboard(item.content);
                            showMessageBox(ok ? '복사되었습니다.' : '복사에 실패했습니다.');
                          }}
                          className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded-md border border-gray-200 flex items-center gap-1"
                        >
                          <Copy className="w-3.5 h-3.5" /> 복사
                        </button>
                        <button
                          onClick={() => {
                            const name = `${item.title.replace(/\s+/g,'_')}_${design.applicationNumber || design.patentId || 'doc'}.txt`;
                            downloadTextFile(name, item.content);
                          }}
                          className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded-md border border-gray-200 flex items-center gap-1"
                        >
                          <Download className="w-3.5 h-3.5" /> 다운로드
                        </button>
                      </div>

                      {expanded && (
                        <pre className="mt-3 text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-md p-3 max-h-64 overflow-auto whitespace-pre-wrap">
{item.content}
                        </pre>
                      )}

                      <div className="mt-3 text-[11px] text-gray-500">
                        ID: {item.ids.join(', ')}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* 유사 디자인 분석 */}
          <section className="mb-6 border border-gray-200 p-6 rounded-xl bg-white shadow-sm">
            <h3 className="font-semibold text-xl mb-4 text-gray-800 flex items-center gap-2">
              <Copy className="w-5 h-5 text-indigo-500" /> AI 유사 디자인 분석
            </h3>

            <div className="flex gap-4 overflow-x-auto pb-2 -mx-2 px-2">
              {isSearchingSimilarity ? (
                <div className="w-full flex justify-center items-center py-8">
                  <div className="w-8 h-8 border-4 border-gray-200 border-t-indigo-500 rounded-full animate-spin"></div>
                  <p className="ml-4 text-gray-600">유사 디자인을 검색하고 있습니다...</p>
                </div>
              ) : similarityResults && similarityResults.length > 0 ? (
                similarityResults.map((result, index) => (
                  <div key={result.similar_patent_code || index} className="min-w-[220px] w-full max-w-[250px] border border-gray-200 rounded-lg bg-white shadow-sm flex-shrink-0 transition-all hover:shadow-md hover:border-indigo-200">
                    <div className="h-32 bg-gray-100 flex items-center justify-center">
                      <img
                        src={result.image_url}
                        alt={`유사 디자인 ${index + 1}`}
                        className="w-full h-full object-contain"
                        onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://placehold.co/400x300/e2e8f0/94a3b8?text=Image+Not+Found'; }}
                      />
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-semibold text-gray-800 truncate">{result.title || `유사 디자인 ${index + 1}`}</p>
                      <p className="text-xs text-gray-500 mt-1">출원번호: {result.application_number}</p>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mt-3">
                        <div className="h-2.5 rounded-full bg-blue-600" style={{ width: `${(result.similarity * 100).toFixed(2)}%` }} />
                      </div>
                      <p className="text-right text-sm font-bold text-blue-700 mt-1">{(result.similarity * 100).toFixed(2)}%</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-600 w-full text-center py-4">AI 분석 결과가 없거나 분석 중입니다.</p>
              )}
            </div>
          </section>

          <div className="text-center mt-6">
            <button
              onClick={() => navigate('/design-dashboard')}
              className="px-6 py-3 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg font-medium transition-all flex items-center gap-2 mx-auto"
            >
              목록으로 돌아가기
            </button>
          </div>
        </div>
      </main>

      {/* 사이드 챗봇 패널 */}
      <div className={`fixed right-0 top-0 h-full w-[450px] bg-white shadow-2xl border-l border-gray-200 transform transition-transform duration-300 ease-in-out z-40 flex flex-col ${isChatOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">디자인 심사 AI 도우미</h3>
              <p className="text-xs text-gray-600">온라인</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setIsChatOpen(false)} className="p-1 hover:bg-gray-200 rounded transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-4 border-b border-gray-100 flex-shrink-0">
          <p className="text-sm font-medium text-gray-700 mb-3">빠른 질문</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'q1', text: '유사 디자인', icon: Copy, query: '이 디자인과 유사한 디자인을 찾아줘' },
              { id: 'q2', text: '심미성 분석', icon: Lightbulb, query: '이 디자인의 심미성에 대해 분석해줘' },
              { id: 'q3', text: '법적 근거', icon: Scale, query: '디자인 등록 거절에 대한 법적 근거는 뭐야?' },
              { id: 'q4', text: '심사 기준', icon: GanttChart, query: '디자인 심사 기준에 대해 알려줘' }
            ].map((q) => (
              <button
                key={q.id}
                onClick={() => handleQuickQuestion(q.query)}
                className="p-2 text-xs bg-gray-50 hover:bg-indigo-50 border border-gray-200 hover:border-indigo-300 rounded-lg transition-all flex flex-col items-center gap-1"
              >
                <q.icon className="w-4 h-4 text-indigo-600" />
                <span className="text-gray-700">{q.text}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {chatMessages.map((message) => (
            <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-3 rounded-lg ${message.type === 'user' ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-800'}`}>
                <p className="text-sm whitespace-pre-line">{message.message}</p>
                <p className={`text-xs mt-1 ${message.type === 'user' ? 'text-indigo-100' : 'text-gray-500'}`}>
                  {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-100 p-3 rounded-lg">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-200 bg-white flex-shrink-0">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendChatMessage()}
              placeholder="궁금한 점을 물어보세요..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            />
            <button
              onClick={() => sendChatMessage()}
              disabled={!inputMessage.trim() || isTyping}
              className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-400 text-white rounded-lg transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-[100]">
          <div className="bg-white rounded-xl shadow-lg p-6 w-96 max-w-[90%] text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <p className="text-gray-700 text-lg font-medium mb-6 whitespace-pre-line">{modalMessage}</p>
            <button
              onClick={() => setShowModal(false)}
              className="px-6 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
            >
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
