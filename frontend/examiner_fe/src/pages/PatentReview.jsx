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
  searchDesignImageByBlob, 
  searchDesignImageByUrl,// 첫 번째 2D 도면으로 자동 유사이미지 검색
} from '../api/ai';
import { sendChatMessage as sendChatbotMessage, checkChatbotHealth } from '../api/chatbot';

// 파일 API (메타 조회 → 안전한 URL 만들기)
import { getImageUrlsByIds, getNonImageFilesByIds, toAbsoluteFileUrl } from '../api/files';
import ThreeDModelViewer from '../components/ThreeDModelViewer';

/* ------------------------- 보조 ------------------------- */

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

// 시연용 거절사유판단 결과
const DEMO_REJECTION_RESULT = `[거절이유 판단 ]

출원발명의 청구항 1 내지 9는 "수술용 로봇 암의 회동 구조"에 관한 것으로, 그립퍼를 지지하는 지지 디스크가 볼 조인트에 의해 X축 및 Y축 방향으로 자유롭게 회동되며, 디스크 둘레에 배치된 복수의 와이어가 모터 구동부와 연결되어 디스크의 기울기 및 회동 각도를 정밀하게 제어하는 구성을 포함하고 있습니다.

그러나, 인용발명 1(공개특허 제10-2009-0089928호)의 청구항 1 및 2에서는
"수술용 로봇 암의 말단 지지부를 원격중심(RCM) 기반의 링크 및 볼 조인트로 연결하여 다축 회동을 가능하게 하고, 케이블/와이어를 통해 모터 구동부에서 말단부 기울기 각도를 제어하는 구조"가 이미 개시되어 있습니다.
따라서 출원발명의 청구항 1 및 청구항 2의 구성은 인용발명 1의 대응 청구항과 실질적으로 동일하여 신규성이 부정됩니다.

또한, 인용발명 2(공개특허 제10-2011-0098027호)의 청구항 3 및 4에서는
"외과용 로봇의 말단부 그립퍼를 다수의 와이어로 구동하여 수술 조직을 정밀하게 파지 및 절단하는 기능"이 개시되어 있습니다.
출원발명의 청구항 3 내지 청구항 5 역시 동일하게 "와이어 구동 방식으로 그립퍼를 정밀 제어"하는 구성을 포함하고 있어, 양 발명의 핵심 기술적 특징이 실질적으로 동일합니다.

나아가, 인용발명 1의 볼 조인트 기반 회동 구조와 인용발명 2의 와이어 구동 그립퍼 제어 방식을 결합하는 것은 당해 기술분야의 통상의 기술자가 용이하게 도출할 수 있는 사항입니다. 두 인용발명은 모두 "수술용 로봇 암의 직관적 조작 및 정밀 제어"라는 동일한 과제를 해결하고 있으며, 이를 단순히 결합한다고 하더라도 새로운 기술적 효과가 창출된다고 보기 어렵습니다.

따라서, 출원발명의 청구항 1 내지 9는 특허법 제29조 제1항(신규성) 및 제2항(진보성)에 따른 요건을 충족하지 못하여 거절이유가 존재합니다. 이에 대해 출원인은 본 통지서를 수령한 날로부터 30일 이내에 의견서 또는 보정서를 제출하여야 합니다.`;
// /files/{id}/content ↔ /api/files/{id}/content 정규화
function normalizeToApiContent(u) {
  try {
    const abs = new URL(u, window.location.origin);
    const p = abs.pathname.replace(/\/+$/, '');
    let m = p.match(/^\/api\/files\/(\d+)\/content$/);
    if (m) return `/api/files/${m[1]}/content`;
    m = p.match(/^\/files\/(\d+)\/content$/);
    if (m) return `/api/files/${m[1]}/content`;
    return u; // 다른 형태면 손대지 않음
  } catch {
    // 절대/상대 경로 문자열일 수 있으니 마지막 시도
    let m = String(u).match(/^\/api\/files\/(\d+)\/content$/);
    if (m) return `/api/files/${m[1]}/content`;
    m = String(u).match(/^\/files\/(\d+)\/content$/);
    if (m) return `/api/files/${m[1]}/content`;
    return u;
  }
}
// 시연용 유사특허 결과
export const MOCK_SIMILAR_RESULTS = [
  {
    title: "수술용 로봇",
    application_number: "1020120043476",
    similarity: 0.87,
    image_url: "http://plus.kipris.or.kr/kiprisplusws/fileToss.jsp?arg=ed43a0609e94d6e22d01c5c32ba711cf9118776b53ad305f8d058a9ca0fd3cb61e7490f1d957bcdf265297316ab471bad4e20946e715ea9a0777d3a4fce530419f0c8ed50381c45c"
  },
  {
    title: "수술 로봇의 절삭 경로 플래닝 장치 및 그 방법",
    application_number: "1020220121028",
    similarity: 0.92,
    image_url: "http://plus.kipris.or.kr/kiprisplusws/fileToss.jsp?arg=ed43a0609e94d6e22d01c5c32ba711cfafcbc342afaea4d5870ccdf59b826823313ce68f4420ea243bfe1a59aa3a63cf317575ca5d3b0c44d3c81eaae44e69e1a0b0f47d5efaef8f"
  },
  {
    title: "전계 인가 장치",
    application_number: "1020200171573",
    similarity: 0.74,
    image_url: "http://plus.kipris.or.kr/kiprisplusws/fileToss.jsp?arg=ed43a0609e94d6e22d01c5c32ba711cfc55451d21dba040280978512582e54ce45afaa9940ea5aff4885a5d51a97b17e8f63d5fb0b66d97e88dcb00b47dc2fcbf2f9b79e2eed4430"
  },
  {
    title: "수술 로봇 시스템 및 그 제어방법",
    application_number: "1020160089635",
    similarity: 0.81,
    image_url: "http://plus.kipris.or.kr/kiprisplusws/fileToss.jsp?arg=ed43a0609e94d6e22d01c5c32ba711cf180e368476a00bc24a2bef232365eb08c1fb7f0b94653d18e8563235341c8ba820ae9f93e8040e277a67dbcd2d51ff3963c94911bdd52f42"
  },
  {
    title: "수술 로봇 시스템",
    application_number: "1020240170032",
    similarity: 0.89,
    image_url: "http://plus.kipris.or.kr/kiprisplusws/fileToss.jsp?arg=ed43a0609e94d6e22d01c5c32ba711cf10add4f4d6d868b31d7afc1cbe6808c324cb9aa7e94b6662c6031a9109bba104d874bbb6b3bada112560a96d6112f8bc8095cb1e0fd01c16"
  }
];




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
      } catch {
        /* empty */
      }
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
    } catch {
      /* empty */
    }

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

// 외부(S3 등) URL이 들어와도 항상 동일 오리진(/api/files/**)으로 강제
function resolveToLocalFileUrl(srcLike, currentPatentId) {
  // 케이스 A: {patentId, fileName}
  if (srcLike && typeof srcLike === 'object' && srcLike.patentId && srcLike.fileName) {
    const enc = encodeURIComponent(srcLike.fileName);
    return `/api/files/${srcLike.patentId}/${enc}`;
  }
  // 케이스 B: 문자열 URL
  if (typeof srcLike === 'string') {
    try {
      const abs = toAbsoluteFileUrl(srcLike);
      const u = new URL(abs, window.location.origin);
      // 이미 same-origin이고 /files|/api/files 면 /api/files 로 통일
      if (u.origin === window.location.origin &&
          (u.pathname.startsWith('/files/') || u.pathname.startsWith('/api/files/'))) {
        return u.pathname.replace('/files/', '/api/files/');
      }
      // 외부(S3 등) → 파일명만 추출해서 /api/files/{patentId}/{fileName}
      const last = decodeURIComponent((u.pathname.split('/').pop() || '').split('?')[0]);
      const clean = last || 'file.bin';
      const enc = encodeURIComponent(clean);
      if (!currentPatentId) return null;
      return `/api/files/${currentPatentId}/${enc}`;
    } catch {
      return null;
    }
  }
  return null;
}
// 파일명에서 UUID 프리픽스 제거
function cleanFileName(name = '') {
  const decoded = decodeURIComponent(name);
  return decoded.replace(/^[0-9a-fA-F-]{36}_/, '');
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


  const [validationErrors, setValidationErrors] = useState([]);
  const [hasValidated, setHasValidated] = useState(false); // 한 번이라도 점검했는지

  // 첨부에서 찾은 glb 뷰어 소스
  const [glbModelUrl, setGlbModelUrl] = useState('');

  // 거절사유판단 관련 상태
  const [showRejectionAnalysis, setShowRejectionAnalysis] = useState(false);
  const [rejectionAnalysisResult, setRejectionAnalysisResult] = useState('');
  const [showApplyToOpinion, setShowApplyToOpinion] = useState(false);

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
    () =>
      drawingSources
        .map((src) => resolveToLocalFileUrl(src, patent?.patentId))
        .filter(Boolean),
    [drawingSources, patent?.patentId]
  );

  const [selectedDrawingIdx, setSelectedDrawingIdx] = useState(0);
  useEffect(() => { setSelectedDrawingIdx(0); }, [drawingSources.length]);

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
            const glb = others.find(
              f =>
                /\.glb($|\?|#)/i.test(f?.name || '') ||
                /\.glb($|\?|#)/i.test(f?.url || '')
            );
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

  const sendChatMessage = async (message = inputMessage) => {
    if (!message.trim()) {
      return;
    }

    const newUserMessage = { id: safeUUID(), type: 'user', message, timestamp: new Date() };
    setChatMessages(prev => [...prev, newUserMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      // 거절사유 관련 키워드가 포함된 경우 시연용 데이터 반환
      const rejectionKeywords = ['거절사유', '거절이유', '거절 이유', '거절 사유', 'rejection'];
      const hasRejectionKeyword = rejectionKeywords.some(keyword => 
        message.toLowerCase().includes(keyword.toLowerCase())
      );
      
      // 문서 점검 관련 키워드가 포함된 경우 시연용 데이터 반환
      const documentCheckKeywords = ['문서 점검', '검토', '서류 점검', 'validate', 'check'];
      const hasDocumentCheckKeyword = documentCheckKeywords.some(keyword => 
        message.toLowerCase().includes(keyword.toLowerCase())
      );
      
      // 보류의견서 반영 여부에 대한 긍정적 답변 감지
      const positiveKeywords = ['네', '응', 'yes', 'ok', '좋아', '그래'];
      const hasPositiveKeyword = positiveKeywords.some(keyword => 
        message.toLowerCase().includes(keyword.toLowerCase())
      );
      
      if (showApplyToOpinion && hasPositiveKeyword) {
        handleApplyToOpinion();
        return;
      }
      
      if (hasRejectionKeyword) {
        // 1-2초 후에 로딩 메시지 표시
        setTimeout(() => {
          const loadingMessage = {
            id: safeUUID(),
            type: 'bot',
            message: '거절사유 유무를 판단중입니다',
            timestamp: new Date(),
            isTyping: true
          };
          setChatMessages(prev => [...prev, loadingMessage]);
          
          // 점진적으로 점 추가
          setTimeout(() => {
            setChatMessages(prev => prev.map(msg => 
              msg.id === loadingMessage.id 
                ? { ...msg, message: '거절사유 유무를 판단중입니다.' }
                : msg
            ));
          }, 500);
          
          setTimeout(() => {
            setChatMessages(prev => prev.map(msg => 
              msg.id === loadingMessage.id 
                ? { ...msg, message: '거절사유 유무를 판단중입니다..' }
                : msg
            ));
          }, 1000);
          
          setTimeout(() => {
            setChatMessages(prev => prev.map(msg => 
              msg.id === loadingMessage.id 
                ? { ...msg, message: '거절사유 유무를 판단중입니다...' }
                : msg
            ));
          }, 1500);
          
          // 10초 후에 결과 표시
          setTimeout(() => {
            const botMessage = {
              id: safeUUID(),
              type: 'bot',
              message: DEMO_REJECTION_RESULT,
              timestamp: new Date()
            };
            setChatMessages(prev => [...prev, botMessage]);
            
            // 보류의견서 반영 여부 묻기
            setTimeout(() => {
              const applyMessage = {
                id: safeUUID(),
                type: 'bot',
                message: '보류의견서에 반영하시겠습니까? (네/아니오)',
                timestamp: new Date()
              };
              setChatMessages(prev => [...prev, applyMessage]);
              setShowApplyToOpinion(true);
            }, 500);
            
            setIsTyping(false);
          }, 10000); // 10초 후 응답
        }, 1500); // 1.5초 후 로딩 메시지
        return;
      }
      
      if (hasDocumentCheckKeyword) {
        // 1-2초 후에 로딩 메시지 표시
        setTimeout(() => {
          const loadingMessage = {
            id: safeUUID(),
            type: 'bot',
            message: '문서 점검을 진행중입니다...',
            timestamp: new Date()
          };
          setChatMessages(prev => [...prev, loadingMessage]);
          
          // 3초 후에 결과 표시
          setTimeout(() => {
            const botMessage = {
              id: safeUUID(),
              type: 'bot',
              message: '형식/문맥 오류는 검출되지 않았습니다.',
              timestamp: new Date()
            };
            setChatMessages(prev => [...prev, botMessage]);
            setIsTyping(false);
          }, 3000); // 3초 후 응답
        }, 1500); // 1.5초 후 로딩 메시지
        return;
      }
            // 유사특허 관련 키워드
      const similarKeywords = ['유사특허', '유사 특허', 'similar', '유사특허 검색해줘'];
      const hasSimilarKeyword = similarKeywords.some(keyword => 
        message.toLowerCase().includes(keyword.toLowerCase())
      );
      
      if (hasSimilarKeyword) {
        setTimeout(() => {
          const loadingMessage = {
            id: safeUUID(),
            type: 'bot',
            message: '유사 특허를 검색중입니다...',
            timestamp: new Date(),
          };
          setChatMessages(prev => [...prev, loadingMessage]);
      
          // 2초 뒤 결과 표시
          setTimeout(() => {
            setSimilarityResults(MOCK_SIMILAR_RESULTS);
            const botMessage = {
              id: safeUUID(),
              type: 'bot',
              message: `총 ${MOCK_SIMILAR_RESULTS.length}건의 유사 특허를 찾았습니다.`,
              timestamp: new Date()
            };
            setChatMessages(prev => [...prev, botMessage]);
            setIsTyping(false);
          }, 2000);
        }, 1000);
        return;
      }


      // 챗봇 서버 상태 확인
      const isHealthy = await checkChatbotHealth();
      if (!isHealthy) {
        throw new Error('챗봇 서버가 응답하지 않습니다. 서버가 실행 중인지 확인해주세요.');
      }

      // 특허 정보 추출
      const applicationText = patent?.description || patent?.summary || patent?.backgroundTechnology || '';
      const claimsText = patent?.claims?.join('\n') || '';
      
      // 세션 ID 생성 (특허 ID 기반)
      const sessionId = `patent_${patent?.patentId || 'default'}_${Date.now()}`;

      // 챗봇 API 호출
      const response = await sendChatbotMessage(sessionId, message, applicationText, claimsText);
      
      if (response.success) {
        const botMessage = {
          id: safeUUID(),
          type: 'bot',
          message: response.data,
          timestamp: new Date()
        };
        setChatMessages(prev => [...prev, botMessage]);
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      console.error('챗봇 메시지 전송 실패:', error);
      const errorMessage = {
        id: safeUUID(),
        type: 'bot',
        message: `죄송합니다. AI 도우미와 연결하는 데 문제가 발생했습니다: ${error.message}`,
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickQuestion = async (query, forcedIntent = null) => {
    if (!query.trim()) return;

    const newUserMessage = { id: safeUUID(), type: 'user', message: query, timestamp: new Date() };
    setChatMessages(prev => [...prev, newUserMessage]);
    setIsTyping(true);

         try {
              // 거절사유판단인 경우 시연용 데이터 반환
        if (forcedIntent === 'rejection_draft') {
          // 1-2초 후에 로딩 메시지 표시
          setTimeout(() => {
            const loadingMessage = {
              id: safeUUID(),
              type: 'bot',
              message: '거절사유 유무를 판단중입니다',
              timestamp: new Date(),
              isTyping: true
            };
            setChatMessages(prev => [...prev, loadingMessage]);
            
            // 점진적으로 점 추가
            setTimeout(() => {
              setChatMessages(prev => prev.map(msg => 
                msg.id === loadingMessage.id 
                  ? { ...msg, message: '거절사유 유무를 판단중입니다.' }
                  : msg
              ));
            }, 500);
            
            setTimeout(() => {
              setChatMessages(prev => prev.map(msg => 
                msg.id === loadingMessage.id 
                  ? { ...msg, message: '거절사유 유무를 판단중입니다..' }
                  : msg
              ));
            }, 1000);
            
            setTimeout(() => {
              setChatMessages(prev => prev.map(msg => 
                msg.id === loadingMessage.id 
                  ? { ...msg, message: '거절사유 유무를 판단중입니다...' }
                  : msg
              ));
            }, 1500);
            
            // 10초 후에 결과 표시
            setTimeout(() => {
              const botMessage = {
                id: safeUUID(),
                type: 'bot',
                message: DEMO_REJECTION_RESULT,
                timestamp: new Date()
              };
              setChatMessages(prev => [...prev, botMessage]);
              
              // 보류의견서 반영 여부 묻기
              setTimeout(() => {
                const applyMessage = {
                  id: safeUUID(),
                  type: 'bot',
                  message: '보류의견서에 반영하시겠습니까? (네/아니오)',
                  timestamp: new Date()
                };
                setChatMessages(prev => [...prev, applyMessage]);
                setShowApplyToOpinion(true);
              }, 500);
              
              setIsTyping(false);
            }, 10000); // 10초 후 응답
          }, 1500); // 1.5초 후 로딩 메시지
          return;
        }
        
        // 문서 점검인 경우 시연용 데이터 반환
        if (forcedIntent === 'validate_doc') {
          // 1-2초 후에 로딩 메시지 표시
          setTimeout(() => {
            const loadingMessage = {
              id: safeUUID(),
              type: 'bot',
              message: '문서 점검을 진행중입니다...',
              timestamp: new Date()
            };
            setChatMessages(prev => [...prev, loadingMessage]);
            
            // 3초 후에 결과 표시
            setTimeout(() => {
              const botMessage = {
                id: safeUUID(),
                type: 'bot',
                message: '형식/문맥 오류는 검출되지 않았습니다.',
                timestamp: new Date()
              };
              setChatMessages(prev => [...prev, botMessage]);
              setIsTyping(false);
            }, 3000); // 3초 후 응답
          }, 1500); // 1.5초 후 로딩 메시지
          return;
        }

      // 챗봇 서버 상태 확인
      const isHealthy = await checkChatbotHealth();
      if (!isHealthy) {
        throw new Error('챗봇 서버가 응답하지 않습니다. 서버가 실행 중인지 확인해주세요.');
      }

      // 특허 정보 추출
      const applicationText = patent?.description || patent?.summary || patent?.backgroundTechnology || '';
      const claimsText = patent?.claims?.join('\n') || '';
      
      // 세션 ID 생성 (특허 ID 기반)
      const sessionId = `patent_${patent?.patentId || 'default'}_${Date.now()}`;

      // 챗봇 API 호출 (forced_intent 포함)
      const response = await sendChatbotMessage(sessionId, query, applicationText, claimsText, forcedIntent);
      
      if (response.success) {
        const botMessage = {
          id: safeUUID(),
          type: 'bot',
          message: response.data,
          timestamp: new Date()
        };
        setChatMessages(prev => [...prev, botMessage]);
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      console.error('챗봇 메시지 전송 실패:', error);
      const errorMessage = {
        id: safeUUID(),
        type: 'bot',
        message: `죄송합니다. AI 도우미와 연결하는 데 문제가 발생했습니다: ${error.message}`,
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

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

  // 보류의견서 반영 함수
  const handleApplyToOpinion = () => {
    setApprovalComment(DEMO_REJECTION_RESULT);
    setSelectedAction('document');
    setShowApplyToOpinion(false);
    showMessageBox('거절사유판단 결과가 보류의견서에 반영되었습니다.');
  };

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

    // 🔵 먼저 모달을 로딩 상태로 띄움
    showMessageBox('오류 점검 중…');

    try {
      const results = await validatePatentDocument(patent.patentId);

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

      // 페이지 본문 표시용 state 사용 중이라면 여기도 유지
      setValidationErrors?.(flat);
      setHasValidated?.(true);

      // 🔵 모달의 내용만 결과로 교체
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

              {/* 배경기술 */}
              <div className="mb-4">
                <h4 className="font-medium text-lg mb-2 text-gray-800 flex items-center gap-1">
                  <Info className="w-4 h-4 text-blue-400" /> 배경기술
                </h4>
                {patent.backgroundTechnology ? (
                  <div className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-md border border-gray-100 max-h-32 overflow-y-auto">
                    {patent.backgroundTechnology}
                  </div>
                ) : (
                  <p className="text-gray-600 col-span-full text-sm bg-gray-50 p-3 rounded-md border border-gray-100">등록된 배경기술이 없습니다.</p>
                )}
              </div>

              {/* 해결 과제 */}
              <div className="mb-4">
                <h4 className="font-medium text-lg mb-2 text-gray-800 flex items-center gap-1">
                  <X className="w-4 h-4 text-blue-400" /> 해결 과제
                </h4>
                {patent.problemToSolve ? (
                  <div className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-md border border-gray-100 max-h-32 overflow-y-auto">
                    {patent.problemToSolve}
                  </div>
                ) : (
                  <p className="text-gray-600 col-span-full text-sm bg-gray-50 p-3 rounded-md border border-gray-100">등록된 해결 과제가 없습니다.</p>
                )}
              </div>

              {/* 해결 수단 */}
              <div className="mb-4">
                <h4 className="font-medium text-lg mb-2 text-gray-800 flex items-center gap-1">
                  <Check className="w-4 h-4 text-blue-400" /> 해결 수단
                </h4>
                {patent.solution ? (
                  <div className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-md border border-gray-100 max-h-32 overflow-y-auto">
                    {patent.solution}
                  </div>
                ) : (
                  <p className="text-gray-600 col-span-full text-sm bg-gray-50 p-3 rounded-md border border-gray-100">등록된 해결 수단이 없습니다.</p>
                )}
              </div>

              {/* 발명의 효과 */}
              <div className="mb-4">
                <h4 className="font-medium text-lg mb-2 text-gray-800 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-blue-400" /> 발명의 효과
                </h4>
                {patent.effect ? (
                  <div className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-md border border-gray-100 max-h-32 overflow-y-auto">
                    {patent.effect}
                  </div>
                ) : (
                  <p className="text-gray-600 col-span-full text-sm bg-gray-50 p-3 rounded-md border border-gray-100">등록된 발명의 효과가 없습니다.</p>
                )}
              </div>

              {/* 도면 설명 */}
              <div className="mb-4">
                <h4 className="font-medium text-lg mb-2 text-gray-800 flex items-center gap-1">
                  <FileText className="w-4 h-4 text-blue-400" /> 도면 설명
                </h4>
                {patent.drawingDescription ? (
                  <div className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-md border border-gray-100 max-h-32 overflow-y-auto">
                    {patent.drawingDescription}
                  </div>
                ) : (
                  <p className="text-gray-600 col-span-full text-sm bg-gray-50 p-3 rounded-md border border-gray-100">등록된 도면 설명이 없습니다.</p>
                )}
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
                        const displayName =
                          typeof srcLike === 'string'
                            ? cleanFileName(srcLike.split('/').pop().split('?')[0])
                            : cleanFileName(srcLike.fileName);
                        return (
                          <button
                            type="button"
                            key={i}
                            onClick={() => setSelectedDrawingIdx(i)}
                            className={`relative border rounded-md overflow-hidden bg-white text-left transition-all focus:outline-none ${active ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-gray-200 hover:ring-1 hover:ring-gray-300'}`}
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
                  <ThreeDModelViewer src={glbModelUrl} />
                ) : (
                  <div className="w-full h-24 bg-gray-50 border border-dashed border-gray-300 rounded-lg flex items-center justify-center text-sm text-gray-500">
                    첨부 파일에서 .glb 파일을 찾지 못했습니다. .glb 파일을 업로드하면 자동으로 표시됩니다.
                  </div>
                )}
              </div>

              {/* AI 서류 점검 결과 */}
              <div className="mt-6">
                <h4 className="font-medium text-lg text-gray-800 flex items-center gap-1">
                  <ScrollText className="w-4 h-4 text-blue-400" />
                  AI 서류 점검 결과
                </h4>

                {/* 점검 후 오류 없음 배너 */}
                {hasValidated && validationErrors.length === 0 && (
                  <div className="mt-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                    점검 완료 ✨ 서류에서 특별한 오류가 발견되지 않았습니다.
                  </div>
                )}

                {/* 오류 리스트 */}
                {validationErrors.length > 0 && (
                  <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-4">
                    <ul className="space-y-2">
                      {validationErrors.map((e, i) => {
                        const tag =
                          e.type === 'FORMAT'  ? '형식오류' :
                          e.type === 'CONTEXT' ? '맥락오류' :
                          e.type === 'MISSING' ? '누락섹션' : (e.type || '오류');

                        const where = e.claim
                          ? ` (${e.claim}${typeof e.claimIndex === 'number' ? `#${e.claimIndex + 1}` : ''})`
                          : (e.field ? ` [${e.field}]` : '');

                        return (
                          <li key={e.id || i} className="text-sm text-red-800">
                            <span className="inline-flex items-center rounded-full border border-red-300 bg-white px-2 py-0.5 text-xs font-semibold text-red-700 mr-2">
                              {tag}
                            </span>
                            <span className="font-medium">{where}</span> {e.message}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

                {/* 아직 점검 전 안내 */}
                {!hasValidated && (
                  <p className="mt-2 text-xs text-gray-500">
                    ※ 상단의 <b>AI 서류 점검</b> 버튼을 눌러 결과를 확인하세요.
                  </p>
                )}
              </div>

            </section>
          </div>

          {/* 유사 특허 분석 (첫 2D 도면 자동 분석) */}
          <section className="mb-6 border border-gray-200 p-6 rounded-xl bg-white shadow-sm">
            <h3 className="font-semibold text-xl mb-4 text-gray-800 flex items-center gap-2">
              <Copy className="w-5 h-5 text-blue-500" /> AI 유사 특허 분석
            </h3>
          
            {isSearchingSimilarity ? (
              <div className="w-full flex justify-center items-center py-8">
                <div className="w-8 h-8 border-4 border-gray-200 border-t-indigo-500 rounded-full animate-spin"></div>
                <p className="ml-3 text-gray-600 font-medium">유사 특허 검색 중...</p>
              </div>
            ) : similarityResults.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {similarityResults.map((item, idx) => (
                  <div
                    key={idx}
                    className="border rounded-lg shadow-sm bg-white overflow-hidden hover:shadow-md transition-all"
                  >
                    <div className="relative w-full h-40 bg-gray-100 flex items-center justify-center">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="text-gray-400 text-sm">이미지 없음</div>
                      )}
                      <span className="absolute top-2 left-2 bg-indigo-600 text-white text-xs font-semibold px-2 py-0.5 rounded">
                        유사도 {(item.similarity * 100).toFixed(1)}%
                      </span>
                    </div>
          
                    <div className="p-3">
                      <h4 className="font-semibold text-gray-800 text-sm truncate mb-1">
                        {item.title}
                      </h4>
                      <p className="text-xs text-gray-600 mb-2">
                        출원번호: {item.application_number}
                      </p>
                      <a
                        href={`https://plus.kipris.or.kr/kipo-mobile/search/detail.do?applno=${item.application_number}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-indigo-600 hover:underline"
                      >
                        특허 상세 보기
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="w-full py-6 text-center text-gray-500 text-sm border border-dashed border-gray-300 rounded-lg bg-gray-50">
                아직 유사 특허 검색 결과가 없습니다.  
                <br /> 상단 챗봇에서 "유사특허 검색"을 입력해보세요.
              </div>
            )}
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
              { id: 'q1', text: '문서 점검', icon: FileText, query: '이 특허 문서에 문제가 있는지 확인해줘', intent: 'validate_doc' },
              { id: 'q2', text: '유사 특허', icon: Copy, query: '이 특허와 유사한 특허를 찾아줘', intent: 'similar_patent' },
              { id: 'q3', text: '거절사유', icon: Scale, query: '이 특허의 거절사유를 분석해줘', intent: 'rejection_draft' },
              { id: 'q4', text: '청구항 초안', icon: ScrollText, query: '이 특허의 청구항 초안을 생성해줘', intent: 'claim_draft' },
            ].map((q) => (
              <button
                key={q.id}
                onClick={() => handleQuickQuestion(q.query, q.intent)}
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
                  {/* 보류의견서 반영 버튼 */}
                  {message.type === 'bot' && message.message.includes('보류의견서에 반영하시겠습니까?') && showApplyToOpinion && (
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={handleApplyToOpinion}
                        className="px-3 py-1.5 bg-blue-500 text-white text-xs rounded-md hover:bg-blue-600 transition-colors"
                      >
                        네, 반영하겠습니다
                      </button>
                      <button
                        onClick={() => setShowApplyToOpinion(false)}
                        className="px-3 py-1.5 bg-gray-300 text-gray-700 text-xs rounded-md hover:bg-gray-400 transition-colors"
                      >
                        아니오
                      </button>
                    </div>
                  )}
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
