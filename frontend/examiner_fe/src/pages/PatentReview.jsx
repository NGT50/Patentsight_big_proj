// src/pages/PatentReview.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Info, FileText, Image, MessageSquare, Copy, FlaskConical,
  CheckCircle, Send, Bot, Lightbulb, GanttChart, Scale, X, ScrollText, Check, File as FileIcon
} from 'lucide-react';

import axiosInstance from '../api/axiosInstance';

import { submitReview, getReviewDetail } from '../api/review';
import {
  startChatSession,
  sendChatMessageToServer,
  validatePatentDocument,
  generateRejectionDraft,
  searchDesignImage, // 첫 번째 2D 도면으로 자동 유사이미지 검색
} from '../api/ai';

// 파일 API (메타 조회 → 안전한 URL 만들기)
import { getImageUrlsByIds, getNonImageFilesByIds, toAbsoluteFileUrl } from '../api/files';

/* ------------------------- 보조 ------------------------- */

// 공개 경로(/files) → 실패 시 /api 로 폴백(fetch+토큰)해서 blob URL로 표출
function SmartImage({ source, className, alt }) {
  const [resolvedSrc, setResolvedSrc] = React.useState('');
  const [triedAuthFetch, setTriedAuthFetch] = React.useState(false);
  const prevObjectUrlRef = React.useRef(null);

  const toPair = React.useMemo(() => {
    if (typeof source === 'string') {
      const abs = toAbsoluteFileUrl(source);
      const isApi = /^\/api\/files\//.test(abs) || /^https?:\/\/.+\/api\/files\//.test(abs);
      return {
        publicUrl: abs.replace('/api/files/', '/files/'),
        apiUrl: isApi ? abs : null,
      };
    }
    if (source && source.patentId && source.fileName) {
      const enc = encodeURIComponent(source.fileName);
      return {
        publicUrl: `/files/${source.patentId}/${enc}`,
        apiUrl: `/api/files/${source.patentId}/${enc}`,
      };
    }
    return { publicUrl: '', apiUrl: null };
  }, [source]);

  React.useEffect(() => {
    if (prevObjectUrlRef.current) {
      URL.revokeObjectURL(prevObjectUrlRef.current);
      prevObjectUrlRef.current = null;
    }
    setResolvedSrc(toPair.publicUrl || '');
    setTriedAuthFetch(false);
    return () => {
      if (prevObjectUrlRef.current) {
        URL.revokeObjectURL(prevObjectUrlRef.current);
        prevObjectUrlRef.current = null;
      }
    };
  }, [toPair.publicUrl, toPair.apiUrl]);

  const handleError = async () => {
    if (toPair.apiUrl && !triedAuthFetch) {
      setTriedAuthFetch(true);
      try {
        const token =
          localStorage.getItem('token') ||
          localStorage.getItem('accessToken') ||
          sessionStorage.getItem('token') ||
          sessionStorage.getItem('accessToken') || '';

        const res = await fetch(toPair.apiUrl, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          credentials: 'include',
        });
        if (!res.ok) throw new Error('auth fetch failed');

        const blob = await res.blob();
        const objUrl = URL.createObjectURL(blob);
        prevObjectUrlRef.current = objUrl;
        setResolvedSrc(objUrl);
        return;
      } catch {}
    }
    setResolvedSrc('https://placehold.co/400x300/e2e8f0/94a3b8?text=Image+Not+Found');
  };

  if (!resolvedSrc) {
    return (
      <div className="w-full h-32 bg-gray-50 border border-gray-200 flex items-center justify-center text-xs text-gray-500">
        이미지 없음
      </div>
    );
  }

  return <img alt={alt} src={resolvedSrc} className={className} onError={handleError} />;
}

// 간단한 3D 뷰어: model-viewer 사용
function ModelViewer3D({ src }) {
  React.useEffect(() => {
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

// 도면 URL 파서 (JSON 배열/콤마/개행/단일 URL)
function extractDrawingUrls(raw) {
  if (!raw) return [];

  const toStr = (v) => (v == null ? '' : String(v)).trim();
  const isUrl = (s) => /^(https?:\/\/|\/|data:image\/)/i.test(toStr(s));

  try {
    const j = JSON.parse(raw);
    if (Array.isArray(j)) {
      return j.map(toStr).filter(isUrl);
    }
  } catch {}

  const candidates = toStr(raw)
    .split(/[\s,;\n\r]+/)
    .map(toStr)
    .filter(Boolean);

  const urls = candidates.filter(isUrl);
  if (urls.length) return urls;

  if (isUrl(raw)) return [toStr(raw)];
  return [];
}

/** 특허 상세에서 도면 소스 구성 */
function buildPatentDrawingSources(p) {
  if (!p) return [];
  const list = [];

  // 1) drawingDescription 내 URL
  list.push(...extractDrawingUrls(p.drawingDescription));

  // 2) drawingFileNames -> {patentId, fileName}
  if (Array.isArray(p.drawingFileNames) && p.drawingFileNames.length > 0) {
    list.push(...p.drawingFileNames.map(fn => ({ patentId: p.patentId, fileName: fn })));
  }

  // 3) (옵션) p.drawings / p.drawingImageUrl 도 있으면 병합
  if (Array.isArray(p.drawings) && p.drawings.length > 0) list.push(...p.drawings);
  if (p.drawingImageUrl) list.push(p.drawingImageUrl);

  // 문자열 중복 제거
  const seen = new Set();
  const out = [];
  for (const it of list) {
    if (typeof it === 'string') {
      const abs = toAbsoluteFileUrl(it);
      if (!seen.has(abs)) { seen.add(abs); out.push(abs); }
    } else out.push(it);
  }
  return out;
}

// 실제 호출용 URL로 변환 (객체는 /api/files 경로, 파일명 인코딩)
function resolveToUrl(srcLike) {
  if (typeof srcLike === 'string') return toAbsoluteFileUrl(srcLike);
  if (srcLike && srcLike.patentId && srcLike.fileName) {
    const enc = encodeURIComponent(srcLike.fileName);
    return `/api/files/${srcLike.patentId}/${enc}`;
  }
  return null;
}

/* ------------------------- 컴포넌트 ------------------------- */

export default function PatentReview() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [patent, setPatent] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedAction, setSelectedAction] = useState('document');
  const [approvalComment, setApprovalComment] = useState('');
  const [rejectionComment, setRejectionComment] = useState('');
  const [status, setStatus] = useState('심사대기');
  const [approvalDocumentText, setApprovalDocumentText] = useState('');

  // 챗봇
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatSessionId, setChatSessionId] = useState(null);

  // 모달
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  // 유사 이미지 상태
  const [similarityResults, setSimilarityResults] = useState([]);
  const [isSearchingSimilarity, setIsSearchingSimilarity] = useState(false);

  // 첨부 분류
  const [attachmentImageUrls, setAttachmentImageUrls] = useState([]); // string[]
  const [attachmentOtherFiles, setAttachmentOtherFiles] = useState([]); // {id,name,url}[]

  // 첨부에서 찾은 glb 뷰어 소스
  const [glbModelUrl, setGlbModelUrl] = useState('');

  // ✅ 특허 상세(첨부 ID 포함) 보조 호출
  const fetchPatentDetail = async (patentId) => {
    try {
      const { data } = await axiosInstance.get(`/api/patents/${patentId}`);
      return data || null;
    } catch (e) {
      console.warn('특허 상세 조회 실패:', e);
      return null;
    }
  };

  // 도면 소스(첨부 이미지 + 특허에서 추출/병합)
  const drawingSources = useMemo(() => {
    const fromPatent = buildPatentDrawingSources(patent);
    const merged = [...attachmentImageUrls, ...fromPatent];
    const seen = new Set();
    return merged.filter((v) => {
      const k = typeof v === 'string' ? v : `${v.patentId}/${v.fileName}`;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  }, [patent, attachmentImageUrls]);

  const contextImageUrls = useMemo(
    () => drawingSources.map(resolveToUrl).filter(Boolean),
    [drawingSources]
  );

  const [selectedDrawingIdx, setSelectedDrawingIdx] = useState(0);
  useEffect(() => { setSelectedDrawingIdx(0); }, [drawingSources.length]);

  const quickQuestions = [
    { id: 'q1', text: '유사 특허', icon: Copy, query: '이 특허와 유사한 특허를 찾아줘' },
    { id: 'q2', text: '진보성 분석', icon: Lightbulb, query: '이 특허의 진보성에 대해 분석해줘' },
    { id: 'q3', text: '법적 근거', icon: Scale, query: '특허 등록 거절에 대한 법적 근거는 뭐야?' },
    { id: 'q4', text: '심사 기준', icon: GanttChart, query: '특허 심사 기준에 대해 알려줘' },
  ];

  // 🔧 상세 & 첨부 로딩 + 상태매핑
  useEffect(() => {
    const fetchReviewData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const data = await getReviewDetail(id);
        setPatent(data);

        // 첨부 이미지/비이미지 로드 (없으면 특허 상세로 보완)
        let attachmentIds = Array.isArray(data.attachmentIds) ? data.attachmentIds : [];

        if ((!attachmentIds || attachmentIds.length === 0) && data.patentId) {
          const patentDetail = await fetchPatentDetail(data.patentId);
          if (patentDetail) {
            if (Array.isArray(patentDetail.attachmentIds)) {
              attachmentIds = patentDetail.attachmentIds;
            }
            if (Array.isArray(patentDetail.drawingFileNames)) {
              setPatent(prev => prev ? { ...prev, drawingFileNames: patentDetail.drawingFileNames } : prev);
            }
          }
        }

        if (attachmentIds && attachmentIds.length > 0) {
          try {
            const [imgs, others] = await Promise.all([
              getImageUrlsByIds(attachmentIds),
              getNonImageFilesByIds(attachmentIds),
            ]);
            setAttachmentImageUrls(imgs);
            setAttachmentOtherFiles(others);

            // 🔎 첨부 비이미지에서 .glb 찾기 → 3D 도면 자동 표시용
            const glb = others.find(f => /\.glb($|\?|#)/i.test(f?.name || '') || /\.glb($|\?|#)/i.test(f?.url || ''));
            setGlbModelUrl(glb ? glb.url : '');
          } catch (e) {
            console.warn('첨부 로드 실패:', e);
            setAttachmentImageUrls([]);
            setAttachmentOtherFiles([]);
            setGlbModelUrl('');
          }
        } else {
          setAttachmentImageUrls([]);
          setAttachmentOtherFiles([]);
          setGlbModelUrl('');
        }

        // 상태 매핑 (Review.Decision: SUBMITTED/REVIEWING/APPROVE/REJECT)
        let translatedStatus = '';
        switch (data.decision) {
          case 'APPROVE':
            translatedStatus = '심사완료';
            setSelectedAction('approval');
            setApprovalDocumentText(data.comment || '최종 등록 승인됨.');
            break;
          case 'REJECT':
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
      } catch (err) {
        console.error('특허 상세 정보 조회 실패:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReviewData();
  }, [id]);

  // ✅ 첫 번째 2D 도면으로 자동 유사 이미지 분석
  useEffect(() => {
    (async () => {
      if (!patent) return;
      if (!drawingSources || drawingSources.length === 0) return;
      const first = drawingSources[0];
      const url = resolveToUrl(first);
      if (!url) return;
      try {
        setIsSearchingSimilarity(true);
        const results = await searchDesignImage(url);
        if (results && results.results) {
          setSimilarityResults(results.results);
        } else {
          setSimilarityResults([]);
        }
      } catch (e) {
        console.warn('자동 유사 분석 실패:', e);
        setSimilarityResults([]);
      } finally {
        setIsSearchingSimilarity(false);
      }
    })();
  }, [patent, drawingSources]);

  const sendChatMessage = async (message = inputMessage) => {
    if (!message.trim() || !patent?.patentId) {
      const errorMessage = {
        id: crypto.randomUUID(),
        type: 'bot',
        message: '오류: 특허 정보가 올바르지 않아 AI와 대화를 시작할 수 없습니다.',
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errorMessage]);
      return;
    }

    const newUserMessage = { id: crypto.randomUUID(), type: 'user', message, timestamp: new Date() };
    setChatMessages(prev => [...prev, newUserMessage]);
    setInputMessage('');
    setIsTyping(true);

    const payload = {
      message,
      requested_features: ['similarity', 'check'],
      context: { image_urls: contextImageUrls },
    };

    try {
      let currentSessionId = chatSessionId;
      if (!currentSessionId) {
        const session = await startChatSession(patent.patentId);
        const sid = session?.session_id || session?.id;
        if (!sid) throw new Error('Failed to get a valid session_id from the server.');
        currentSessionId = sid;
        setChatSessionId(currentSessionId);
      }
      const botResponse = await sendChatMessageToServer(currentSessionId, payload);
      const botMessage = {
        id: botResponse?.message_id || crypto.randomUUID(),
        type: 'bot',
        message: botResponse?.content ?? '응답이 비어 있습니다.',
        timestamp: botResponse?.created_at ? new Date(botResponse.created_at) : new Date(),
      };
      setChatMessages(prev => [...prev, botMessage]);

      if (botResponse?.executed_features?.length > 0) {
        const featuresMessage = {
          id: crypto.randomUUID(),
          type: 'bot-features',
          features: botResponse.executed_features,
          results: botResponse.features_result,
          timestamp: new Date(),
        };
        setChatMessages(prev => [...prev, featuresMessage]);
      }
    } catch (e) {
      console.error('챗봇 메시지 전송 실패:', e);
      setChatMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        type: 'bot',
        message: '죄송합니다. AI 도우미와 연결하는 데 문제가 발생했습니다.',
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickQuestion = (q) => sendChatMessage(q);

  const getStatusColorClass = (s) => {
    switch (s) {
      case '심사완료':
      case '등록결정': return 'bg-green-100 text-green-700';
      case '심사대기': return 'bg-blue-100 text-blue-800';
      case '심사중': return 'bg-yellow-100 text-yellow-800';
      case '거절': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const showMessageBox = (m) => { setModalMessage(m); setShowModal(true); };

  // ⛳ 보류 의견서 → REVIEWING, 거절 사유서 → REJECT
  const handleReviewSubmit = async () => {
    let currentComment, decision, message, newStatus;
    if (selectedAction === 'document') {
      currentComment = approvalComment;
      decision = 'REVIEWING';
      newStatus = '심사중';
      message = '의견서가 제출되었습니다. 상태가 "심사중"으로 변경됩니다.';
    } else if (selectedAction === 'rejection') {
      currentComment = rejectionComment;
      decision = 'REJECT';
      newStatus = '거절';
      message = '거절사유서가 제출되었습니다. 상태가 "거절"으로 변경됩니다.';
    } else return;

    if (!currentComment?.trim()) return showMessageBox('의견을 입력해주세요.');

    const requestData = { patentId: patent.patentId, decision, comment: currentComment };
    try {
      await submitReview(requestData);
      setStatus(newStatus);
      showMessageBox(message);
    } catch (e) {
      console.error('심사 제출 실패:', e);
      showMessageBox('심사 제출에 실패했습니다. 다시 시도해 주세요.');
    }
  };

  const prepareFinalApproval = () => {
    setSelectedAction('approval');
    const doc = `
[특허 등록 결정 의견서]

출원번호: ${patent.applicationNumber}
특허명: ${patent.title}
출원인: ${patent.applicantName}
심사관: ${patent.examinerName}
--------------------------------------------------

귀하의 특허출원 ${patent.applicationNumber}에 대하여 심사한 결과, 본 출원은 특허법 관련 규정에 의거하여 다음과 같은 사유로 특허 등록이 결정되었음을 통지합니다.

1. 신규성 및 진보성:
 - 본 발명의 핵심 기술인 '${patent.summary}'은 기존 선행기술과 명확히 구별되는 독창적인 기술적 특징을 포함하고 있습니다.

2. 산업상 이용 가능성:
 - 본 발명은 관련 산업 분야에 적용 가능하며, 시장에 긍정적인 영향을 줄 것으로 기대됩니다.

3. 기재 요건 충족 여부:
 - 출원서의 청구범위 및 발명의 상세한 설명은 명확하고 구체적으로 기재되어 있습니다.

따라서, 본 발명은 특허 등록 요건을 모두 충족하므로 특허 등록을 결정합니다.

${new Date().getFullYear()}년 ${new Date().getMonth() + 1}월 ${new Date().getDate()}일

대한민국 특허청
심사관 ${patent.examinerName}
    `;
    setApprovalDocumentText(doc.trim());
  };

  const handleFinalizeApproval = async () => {
    const requestData = { patentId: patent.patentId, decision: 'APPROVE', comment: approvalDocumentText || '최종 등록 승인됨.' };
    try {
      await submitReview(requestData);
      setStatus('심사완료');
      showMessageBox('특허가 최종 승인 처리되었습니다.');
    } catch (e) {
      console.error('최종 승인 실패:', e);
      showMessageBox('최종 승인 처리에 실패했습니다.');
    }
  };

  const handleDocumentCheck = async () => {
    if (!patent) return;
    showMessageBox('AI가 출원 서류를 점검 중입니다...');
    try {
      const results = await validatePatentDocument(patent.patentId);
      if (results?.length) {
        const msg = results.map(err => `[${err.error_type}] ${err.message}`).join('\n\n');
        showMessageBox(`점검 결과:\n\n${msg}`);
      } else showMessageBox('점검 완료 ✨\n\n서류에서 특별한 오류가 발견되지 않았습니다.');
    } catch (e) {
      console.error('출원 서류 점검 실패:', e);
      showMessageBox('오류: 서류 점검 중 문제가 발생했습니다.');
    }
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

  if (!patent) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-gray-700 font-medium">특허 정보를 찾을 수 없습니다.</p>
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
              <Image className="w-7 h-7 text-blue-600" />
              <span>특허 심사 시스템</span>
            </h2>
            <button
              onClick={() => setIsChatOpen(!isChatOpen)}
              className={`fixed right-8 bottom-8 z-50 p-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 ${isChatOpen ? 'translate-x-[-420px]' : 'translate-x-0'}`}
            >
              <Bot className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-8 font-sans">
          {/* 출원 정보 */}
          <section className="mb-6 border border-gray-200 p-6 rounded-xl bg-white shadow-sm">
            <h3 className="font-semibold text-xl mb-4 text-gray-800 flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-500" /> 출원 정보
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-3 text-gray-700">
              <p><strong>출원번호:</strong> <span className="font-medium text-gray-900">{patent.applicationNumber}</span></p>
              <p><strong>접수일자:</strong> <span className="font-medium text-gray-900">{patent.applicationDate}</span></p>
              <p><strong>출원인:</strong> <span className="font-medium text-gray-900">{patent.applicantName || '정보 없음'}</span></p>
              <p><strong>특허명:</strong> <span className="font-medium text-gray-900">{patent.title}</span></p>
              <p>
                <strong>심사상태:</strong>
                <span className={`font-semibold ${getStatusColorClass(status)} px-2 py-1 rounded text-sm ml-2`}>{status}</span>
              </p>
              <p><strong>분류:</strong> <span className="font-medium text-gray-900">{patent.technicalField}</span></p>
              <p><strong>담당 심사관:</strong> <span className="font-medium text-gray-900">{patent.examinerName || '정보 없음'}</span></p>
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* 심사 의견서 */}
            <section className={`border border-gray-200 p-5 rounded-xl bg-white shadow-sm ${isFinalStatus ? 'opacity-60 bg-gray-50' : ''}`}>
              <h3 className="font-semibold text-xl mb-4 text-gray-800 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-500" /> 심사 의견서 작성
              </h3>

              <div className="flex gap-1 p-1 bg-gray-50 rounded-xl mb-6 border border-gray-200">
                <button
                  onClick={() => setSelectedAction('document')}
                  disabled={isFinalStatus}
                  className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${selectedAction === 'document' ? 'bg-gradient-to-r from-yellow-500 to-amber-600 text-white shadow-md transform scale-[1.02]' : 'text-yellow-700 bg-yellow-50 hover:bg-yellow-100'}`}
                >📝 보류 의견서</button>
                <button
                  onClick={() => setSelectedAction('rejection')}
                  disabled={isFinalStatus}
                  className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${selectedAction === 'rejection' ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-md transform scale-[1.02]' : 'text-red-700 bg-red-50 hover:bg-red-100'}`}
                >✗ 거절 사유서</button>
                <button
                  onClick={prepareFinalApproval}
                  disabled={isFinalStatus}
                  className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${selectedAction === 'approval' ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 shadow-md' : 'text-blue-700 bg-blue-50 hover:bg-blue-100'}`}
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
                          if (!patent) return;
                          try {
                            const draft = await generateRejectionDraft(patent.patentId);
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
                    placeholder={selectedAction === 'document'
                      ? '보류 사유 및 보완이 필요한 사항에 대해 작성해주세요.'
                      : selectedAction === 'rejection'
                        ? '거절 이유를 구체적으로 작성해주세요.'
                        : ''}
                    value={selectedAction === 'document' ? approvalComment : selectedAction === 'rejection' ? rejectionComment : approvalDocumentText}
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
                        className={`px-5 py-2 text-white rounded-lg font-medium flex items-center gap-2 transition-all disabled:bg-gray-400 ${selectedAction === 'document'
                          ? 'bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700'
                          : 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700'}`}
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
                <FileText className="w-5 h-5 text-blue-500" /> 심사 대상
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
                  <FileText className="w-4 h-4 text-blue-400" /> 청구항
                </h4>
                {patent.claims?.length ? (
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 bg-gray-50 p-3 rounded-md border border-gray-100 max-h-32 overflow-y-auto">
                    {patent.claims.map((c, i) => <li key={i}>{c}</li>)}
                  </ul>
                ) : (
                  <p className="text-gray-600 col-span-full text-sm bg-gray-50 p-3 rounded-md border border-gray-100">등록된 청구항이 없습니다.</p>
                )}
              </div>

              {/* 요약 */}
              <div className="mb-4">
                <h4 className="font-medium text-lg mb-2 text-gray-800 flex items-center gap-1">
                  <FileText className="w-4 h-4 text-blue-400" /> 요약
                </h4>
                <div className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-md border border-gray-100 max-h-32 overflow-y-auto">
                  {patent.description || patent.summary}
                </div>
              </div>

              {/* 2D 도면 */}
              <div className="flex flex-col lg:flex-row gap-6 mb-4">
                <div className="flex-1 w-full">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-lg text-gray-800 flex items-center gap-1">
                      <Image className="w-4 h-4 text-blue-400" /> 2D 도면
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
                        return (
                          <button
                            type="button"
                            key={i}
                            onClick={() => setSelectedDrawingIdx(i)}
                            className={`relative border rounded-md overflow-hidden bg-white text-left transition-all focus:outline-none ${active ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-gray-200 hover:ring-1 hover:ring-gray-300'}`}
                            title={typeof srcLike === 'string' ? srcLike : srcLike.fileName}
                          >
                            <SmartImage source={srcLike} alt={`도면 ${i + 1}`} className="w-full h-32 object-contain bg-white" />
                            {active && (
                              <span className="absolute top-2 right-2 text-[10px] px-2 py-0.5 rounded-full bg-indigo-600 text-white">
                                선택됨
                              </span>
                            )}
                            <div className="p-2 text-[11px] text-gray-600 truncate">
                              {typeof srcLike === 'string' ? srcLike : `${srcLike.patentId}/${srcLike.fileName}`}
                            </div>
                          </button>
                        );
                      })
                    ) : (
                      <p className="text-gray-600 col-span-full text-sm bg-gray-50 p-3 rounded-md border border-gray-100">
                        등록된 2D 도면이 없습니다.
                      </p>
                    )}
                  </div>

                  {/* 이미지가 없고 비이미지 첨부만 있을 때 */}
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
                            <a href={f.url} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline text-xs flex-shrink-0">
                              열기
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* 3D 도면 (.glb 첨부 자동 표시) */}
              <div className="mt-6">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium text-lg text-gray-800 flex items-center gap-1">
                    <Image className="w-4 h-4 text-blue-400" /> 3D 도면
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

          {/* 유사 특허 분석 (첫 2D 도면 자동 분석) */}
          <section className="mb-6 border border-gray-200 p-6 rounded-xl bg-white shadow-sm">
            <h3 className="font-semibold text-xl mb-4 text-gray-800 flex items-center gap-2">
              <Copy className="w-5 h-5 text-blue-500" /> AI 유사 특허 분석
            </h3>
            <div className="flex gap-4 overflow-x-auto pb-2 -mx-2 px-2">
              {isSearchingSimilarity ? (
                <div className="w-full flex justify-center items-center py-8">
                  <div className="w-8 h-8 border-4 border-gray-200 border-t-indigo-500 rounded-full animate-spin"></div>
                  <p className="ml-4 text-gray-600">유사 특허를 검색하고 있습니다...</p>
                </div>
              ) : similarityResults?.length ? (
                similarityResults.map((r, i) => (
                  <div key={r.similar_patent_code || i} className="min-w-[220px] w-full max-w-[250px] border border-gray-200 rounded-lg bg-white shadow-sm flex-shrink-0 transition-all hover:shadow-md hover:border-indigo-200">
                    <div className="h-32 bg-gray-100 flex items-center justify-center">
                      <img
                        src={r.image_url}
                        alt={`유사 결과 ${i + 1}`}
                        className="w-full h-full object-contain"
                        onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://placehold.co/400x300/e2e8f0/94a3b8?text=Image+Not+Found'; }}
                      />
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-semibold text-gray-800 truncate">{r.title || `유사 결과 ${i + 1}`}</p>
                      <p className="text-xs text-gray-500 mt-1">출원번호: {r.application_number}</p>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mt-3">
                        <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${Number(r.similarity * 100 || 0).toFixed(2)}%` }}></div>
                      </div>
                      <p className="text-right text-sm font-bold text-blue-700 mt-1">{Number(r.similarity * 100 || 0).toFixed(2)}%</p>
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
              onClick={() => navigate('/patent-dashboard')}
              className="px-6 py-3 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg font-medium transition-all flex items-center gap-2 mx-auto"
            >
              목록으로 돌아가기
            </button>
          </div>
        </div>
      </main>

      {/* 사이드 챗봇 패널 */}
      <div className={`fixed right-0 top-0 h-full w-[450px] bg-white shadow-2xl border-l border-gray-200 transform transition-transform duration-300 ease-in-out z-40 flex flex-col ${isChatOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">특허 심사 AI 도우미</h3>
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
              { id: 'q1', text: '유사 특허', icon: Copy, query: '이 특허와 유사한 특허를 찾아줘' },
              { id: 'q2', text: '진보성 분석', icon: Lightbulb, query: '이 특허의 진보성에 대해 분석해줘' },
              { id: 'q3', text: '법적 근거', icon: Scale, query: '특허 등록 거절에 대한 법적 근거는 뭐야?' },
              { id: 'q4', text: '심사 기준', icon: GanttChart, query: '특허 심사 기준에 대해 알려줘' },
            ].map((q) => (
              <button
                key={q.id}
                onClick={() => handleQuickQuestion(q.query)}
                className="p-2 text-xs bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg transition-all flex flex-col items-center gap-1"
              >
                <q.icon className="w-4 h-4 text-blue-600" />
                <span className="text-gray-700">{q.text}</span>
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {chatMessages.map((message) => {
            if (message.type === 'bot-features') {
              return (
                <div key={message.id} className="flex justify-start">
                  <div className="max-w-[85%] p-3 rounded-lg bg-indigo-50 border border-indigo-200 text-sm">
                    <p className="font-semibold text-indigo-800 mb-2 flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-indigo-500" />
                      AI가 다음 작업을 수행했습니다:
                    </p>
                    <ul className="space-y-1.5 pl-2">
                      {message.features.map((feature, index) => (
                        <li key={index} className="text-gray-700">
                          - <strong>{feature}:</strong> {message.results[index]}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            }
            return (
              <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-lg ${message.type === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800'}`}>
                  <p className="text-sm whitespace-pre-line">{message.message}</p>
                  <p className={`text-xs mt-1 ${message.type === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })}
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
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
            <button
              onClick={() => sendChatMessage()}
              disabled={!inputMessage.trim() || isTyping}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg transition-colors"
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
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
