import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import {
  Palette, Info, Image, MessageSquare, Copy, FlaskConical, 
  CheckCircle, XCircle, Send, Bot, Lightbulb, GanttChart, Scale, X, 
  Clock 
} from 'lucide-react';

// ThreeDModelViewer 컴포넌트가 필요하다면 임포트합니다.
// 만약 ThreeDModelViewer.jsx 파일이 없다면 이 줄을 제거하거나 해당 컴포넌트를 구현해야 합니다.
import ThreeDModelViewer from '../components/ThreeDModelViewer'; 

export default function DesignReview() {
  const { id } = useParams(); // URL 파라미터에서 reviewId를 가져옵니다.
  const navigate = useNavigate();
  const [reviewDetail, setReviewDetail] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 심사 의견 관련 상태 (백엔드 데이터에 따라 초기값 설정)
  const [reviewType, setReviewType] = useState('approval'); 
  const [approvalComment, setApprovalComment] = useState('');
  const [rejectionComment, setRejectionComment] = useState('');
  const [status, setStatus] = useState(''); 

  // 챗봇 관련 상태
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  // isMinimized 상태는 완전히 제거되었습니다.

  // 빠른 질문 버튼 데이터
  const quickQuestions = [
    { text: '유사 디자인', icon: Copy, query: '유사 디자인' },
    { text: '심미성', icon: Lightbulb, query: '심미성' },
    { text: '법적 근거', icon: Scale, query: '법적 근거' },
    { text: '심사 기준', icon: GanttChart, query: '심사 기준' },
  ];

  // 챗봇 메시지 전송 함수
  const sendChatMessage = async (message = inputMessage) => {
    if (!message.trim()) return;

    const newUserMessage = {
      id: Date.now(),
      type: 'user',
      message: message,
      timestamp: new Date()
    };
    setChatMessages(prev => [...prev, newUserMessage]);
    setInputMessage('');
    setIsTyping(true);

    // 봇 응답 시뮬레이션 (백엔드 API 호출로 대체 가능)
    setTimeout(() => {
      const responses = {
        '유사 디자인': `${reviewDetail.patentTitle}과 관련된 유사 디자인을 분석해보니, 다음과 같은 디자인들이 발견되었습니다:\n1. 출원번호 2023-D001: "미니멀리즘 스피커 디자인"\n   - 유사점: 단순한 형태, 특정 재질 사용\n   - 차이점: 곡선형 마감, 컬러 팔레트 다름\n2. 출원번호 2023-D002: "레트로 스타일 탁상시계"\n   - 유사점: 전반적인 분위기\n   - 차이점: 재료, 디테일한 부분에서 차이\n현재 출원의 독창성이 인정될 가능성이 높습니다.`,
        '심미성': `이 디자인의 심미성을 다음 관점에서 검토해보세요:\n**형태의 독창성 (Originality of Form)**\n- 기존 디자인과 확연히 구분되는 조형적 특징 ✅\n- 균형감 있고 조화로운 구성 ✅\n**색상 및 재질의 조화 (Harmony of Color and Material)**\n- 색상 조합이 디자인 의도와 부합 ✅\n- 재질감이 디자인의 고급스러움을 더함\n**기능과의 조화 (Harmony with Function)**\n- 디자인이 제품의 기능을 효과적으로 보완\n권장사항: 등록 결정이 적절해 보입니다.`,
        '법적 근거': `디자인보호법 관련 조항을 검토해드립니다:\n**디자인보호법 제33조 (디자인등록요건)**\n1. 공업상 이용가능성 - ✅ 충족\n2. 신규성 - ✅ 기존 디자인과 차별화됨\n3. 창작 비용이성 - ✅ 독창적이고 심미성이 뛰어남\n**디자인보호법 제42조 (디자인등록출원서의 기재사항)**\n- 디자인의 설명 - ✅ 명확하게 기재 확인\n- 도면 또는 사진 - ✅ 충분히 기재됨\n**디자인보호법 제62조 (거절결정)**\n거절 사유에 해당하지 않으므로 등록 결정 권장`,
        '심사 기준': `디자인 심사 기준:\n**디자인의 유사 여부 판단**\n- 형태, 모양, 색채의 유사성 종합적 검토 ✅\n- 전체적인 심미감의 유사성 판단 ✅\n**창작 비용이성 판단**\n- 통상의 디자이너가 용이하게 창작할 수 있는지 여부\n- 새로운 미감의 창출 여부 ✅\n**디자인의 설명 및 도면의 명확성**\n- 출원된 디자인이 정확히 표현되어 있는지 ✅\n권장사항: 현재 출원은 심사 기준을 잘 충족하고 있습니다.`
      };
      let botResponse = "죄송합니다. 더 구체적인 질문을 해주시면 도움을 드릴 수 있습니다.";

      const messageKeys = Object.keys(responses);
      for (const key of messageKeys) {
        if (message.includes(key) || message.includes(key.substring(0, 2))) {
          botResponse = responses[key];
          break;
        }
      }
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        message: botResponse,
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleQuickQuestion = (query) => {
    sendChatMessage(query);
  };

  // 데이터 로딩 useEffect
  useEffect(() => {
    const fetchReviewDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        // 백엔드 API 호출: /api/reviews/{reviewId}
        const response = await fetch(`http://localhost:8080/api/reviews/${id}`);
        if (!response.ok) {
          throw new Error(`심사 상세 정보를 불러오는 데 실패했습니다: ${response.status}`);
        }
        const data = await response.json();
        setReviewDetail(data);
        // 백엔드에서 가져온 decision을 기반으로 status 상태 초기화
        setStatus(data.decision); 
        // 기존 의견이 있다면 로드 (선택 사항)
        if (data.comment) {
            if (data.decision === 'APPROVE') { 
                setReviewType('approval');
                setApprovalComment(data.comment);
            } else if (data.decision === 'REJECT') { 
                setReviewType('rejection');
                setRejectionComment(data.comment);
            } else { 
                setReviewType('approval');
                setApprovalComment(data.comment);
            }
        }

      } catch (err) {
        setError(err.message);
        console.error("심사 상세 정보 API 호출 중 오류 발생:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchReviewDetail();
    }
  }, [id]); 

  const getStatusColorClass = (currentStatus) => {
    switch (currentStatus) {
      case 'PENDING': return 'bg-blue-100 text-blue-800'; 
      case 'REVIEWING': return 'bg-yellow-100 text-yellow-800'; 
      case 'APPROVE': return 'bg-green-100 text-green-700'; 
      case 'REJECT': return 'bg-red-100 text-red-700'; 
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleReviewSubmit = async () => { 
    const currentComment = reviewType === 'approval' ? approvalComment : rejectionComment;
    const decisionStatus = reviewType === 'approval' ? 'APPROVE' : 'REJECT'; 

    if (currentComment.trim() === '') {
      alert(`${reviewType === 'approval' ? '의견서' : '거절 사유서'}를 입력해주세요.`);
      return;
    }

    try {
        const response = await fetch(`http://localhost:8080/api/reviews/submit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                patentId: reviewDetail.patentId, 
                decision: decisionStatus,
                comment: currentComment,
            }),
        });

        if (!response.ok) {
            throw new Error(`심사 의견 제출에 실패했습니다: ${response.status}`);
        }

        const result = await response.json();
        alert(`${reviewType === 'approval' ? '의견서' : '거절 사유서'}가 성공적으로 제출되었습니다!`);
        setStatus(result.decision); 
        setReviewDetail(prev => ({ ...prev, decision: result.decision, comment: result.comment, reviewedAt: result.reviewedAt }));

    } catch (err) {
        setError(err.message);
        console.error("심사 의견 제출 중 오류 발생:", err);
        alert(`심사 의견 제출 중 오류 발생: ${err.message}`);
    }
  };

  const handleFinalApproval = async () => { 
    try {
        const response = await fetch(`http://localhost:8080/api/patents/status/${reviewDetail.patentId}`, { 
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: 'APPROVED' }), 
        });

        if (!response.ok) {
            throw new Error(`최종 출원 승인에 실패했습니다: ${response.status}`);
        }

        alert('출원이 최종 승인되었습니다!');
        setStatus('APPROVE'); 
        setReviewDetail(prev => ({ ...prev, patent: { ...prev.patent, status: 'APPROVED' } }));

    } catch (err) {
        setError(err.message);
        console.error("최종 출원 승인 중 오류 발생:", err);
        alert(`최종 출원 승인 중 오류 발생: ${err.message}`);
    }
  };

  // reviewDetail이 로딩 중이거나 에러 발생 시 UI
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-pink-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center text-gray-600">
          <Clock className="w-12 h-12 animate-spin mx-auto mb-4 text-indigo-500" />
          <p className="text-lg font-semibold">심사 상세 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-pink-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center text-red-600">
          <AlertCircle className="w-12 h-12 mx-auto mb-4" />
          <p className="text-lg font-semibold">오류: {error}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-6 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
          >
            뒤로 가기
          </button>
        </div>
      </div>
    );
  }

  // reviewDetail이 null일 경우 (데이터를 찾을 수 없을 때) UI
  if (!reviewDetail) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-pink-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center text-gray-600">
          <Info className="w-12 h-12 mx-auto mb-4" />
          <p className="text-lg font-semibold">심사 정보를 찾을 수 없습니다. reviewId: {id}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-6 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
          >
            뒤로 가기
          </button>
        </div>
      </div>
    );
  }

  // 이제 design 대신 reviewDetail 객체를 사용합니다.
  const designInfo = reviewDetail.patent || {}; 

  return (
    <div className="bg-gradient-to-br from-slate-50 via-pink-50 to-indigo-50 min-h-screen relative">
      <Header />
      <div className="bg-white shadow-sm border-b">
        <div className="px-8 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-800">
            <Palette className="w-7 h-7 text-indigo-600"/> 
            <span>디자인/상표 심사 의견서</span>
          </h2>
          
          {/* 챗봇 토글 버튼 */}
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
        {/* 1. 출원 정보 */}
        <section className="mb-6 border border-gray-200 p-6 rounded-xl bg-white shadow-sm">
          <h3 className="font-semibold text-xl mb-4 text-gray-800 flex items-center gap-2">
            <Info className="w-5 h-5 text-indigo-500" /> 출원 정보
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-3 text-gray-700">
            <p><strong>출원번호:</strong> <span className="font-medium text-gray-900">{designInfo.applicationNumber || 'N/A'}</span></p> 
            <p><strong>접수일자:</strong> <span className="font-medium text-gray-900">{designInfo.submittedAt ? new Date(designInfo.submittedAt).toLocaleDateString() : 'N/A'}</span></p> 
            <p><strong>출원인:</strong> <span className="font-medium text-gray-900">{reviewDetail.applicantName || 'N/A'}</span></p> 
            <p><strong>디자인명:</strong> <span className="font-medium text-gray-900">{designInfo.title || 'N/A'}</span></p> 
            <p>
              <strong>심사상태:</strong> 
              <span className={`font-semibold ${getStatusColorClass(status)} px-2 py-1 rounded text-sm ml-2`}>
                {status}
              </span>
            </p>
            <p><strong>분류:</strong> <span className="font-medium text-gray-900">{designInfo.type || 'N/A'}</span></p> 
            <p><strong>담당 심사관:</strong> <span className="font-medium text-gray-900">{reviewDetail.examinerName || 'N/A'}</span></p> 
          </div>
        </section>

        {/* 2열 레이아웃: 좌측 의견서 작성, 우측 심사 대상 도면 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* 좌측: 심사 의견 작성 */}
          <section className="border border-gray-200 p-5 rounded-xl bg-white shadow-sm">
            <h3 className="font-semibold text-xl mb-4 text-gray-800 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-indigo-500" /> 심사 의견 작성
            </h3>
            
            {/* 라디오 버튼 */}
            <div className="mb-4 p-3 bg-gray-50 rounded-lg w-full">
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="reviewType"
                    value="approval"
                    checked={reviewType === 'approval'}
                    onChange={(e) => setReviewType(e.target.value)}
                    className="w-4 h-4 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-green-700 font-medium flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    의견서
                  </span>
                </label>
                
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="reviewType"
                    value="rejection"
                    checked={reviewType === 'rejection'}
                    onChange={(e) => setReviewType(e.target.value)}
                    className="w-4 h-4 text-red-600 focus:ring-red-500"
                  />
                  <span className="text-red-700 font-medium flex items-center gap-1">
                    <XCircle className="w-4 h-4" />
                    거절 사유서
                  </span>
                </label>
              </div>
            </div>

            {/* 승인 의견서 작성 */}
            {reviewType === 'approval' && (
              <div className="mb-4 w-full">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  의견서 작성
                </label>
                <textarea
                  rows={16}
                  className="w-full border border-gray-300 px-4 py-3 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-y"
                  placeholder="등록 결정 이유 및 디자인의 독창성, 심미성에 대한 의견을 작성해주세요.

예시:
- 본 디자인은 기존 디자인 대비 명확한 독창성을 보임
- 선행 디자인과의 차별점이 명확히 기재되어 있음
- 전체적인 심미감이 우수함"
                  value={approvalComment}
                  onChange={(e) => setApprovalComment(e.target.value)}
                />
              </div>
            )}

            {/* 거절 사유서 작성 */}
            {reviewType === 'rejection' && (
              <div className="mb-4 w-full">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  거절 사유서 작성
                </label>
                <textarea
                  rows={16}
                  className="w-full border border-gray-300 px-4 py-3 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all resize-y"
                  placeholder="거절 이유를 구체적으로 작성해주세요.

예시:
- 선행 디자인: [디자인명, 출원번호]
- 신규성/독창성 결여 사유
- 도면의 불명확성
- 기재 요건 위반 사항"
                  value={rejectionComment}
                  onChange={(e) => setRejectionComment(e.target.value)}
                />
              </div>
            )}

            {/* 의견 제출 버튼 */}
            <div className="flex justify-end w-full">
              <button
                onClick={handleReviewSubmit}
                className={`px-5 py-2 text-white rounded-lg font-medium flex items-center gap-2 transition-all ${
                  reviewType === 'approval'
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
                    : 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700'
                }`}
              >
                <Send className="w-4 h-4" />
                {reviewType === 'approval' ? '의견서 제출' : '사유서 제출'}
              </button>
            </div>
          </section>

          {/* 우측: 심사 대상 도면 */}
          <section className="border border-gray-200 p-6 rounded-xl bg-white shadow-sm">
            <h3 className="font-semibold text-xl mb-4 flex items-center gap-2 text-gray-800">
              <Image className="w-5 h-5 text-indigo-500" /> 심사 대상 도면
            </h3>
            
            <div className="flex flex-col lg:flex-row gap-6 mb-4">
              {/* 2D 도면 섹션 */}
              <div className={`flex-1 ${designInfo.modelPath ? 'lg:w-1/2' : 'w-full'}`}>
                <h4 className="font-medium text-lg mb-2 text-gray-800 flex items-center gap-1">
                  <Image className="w-4 h-4 text-indigo-400" /> 2D 도면
                </h4>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {designInfo.images && designInfo.images.length > 0 ? (
                    designInfo.images.map((imagePath, index) => (
                      <div key={index} className="border border-gray-200 rounded-md overflow-hidden bg-white shadow-sm">
                        <img src={imagePath} alt={`디자인 도면 ${index + 1}`} className="w-full h-20 object-cover bg-gray-200" />
                        <p className="p-1 text-center text-xs text-gray-600 border-t border-gray-100">도면 {index + 1}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-600 col-span-full text-sm bg-gray-50 p-3 rounded-md border border-gray-100">등록된 2D 도면이 없습니다.</p>
                  )}
                </div>
              </div>

              {/* 3D GLB 모델 섹션 */}
              {designInfo.modelPath && (
                <div className="flex-1 lg:w-1/2 mt-6 lg:mt-0">
                  <h4 className="font-medium text-lg mb-2 text-gray-800 flex items-center gap-1">
                    <FlaskConical className="w-4 h-4 text-indigo-400" /> 3D 디자인 모델
                  </h4>
                  <ThreeDModelViewer glbPath={designInfo.modelPath} />
                </div>
              )}
              {!designInfo.modelPath && designInfo.images && designInfo.images.length > 0 && (
                <div className="flex-1 lg:w-1/2 mt-6 lg:mt-0">
                  <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded-md border border-gray-100 h-full flex items-center justify-center">
                    등록된 3D 모델이 없습니다.
                  </p>
                </div>
              )}
            </div>

            <div>
              <div className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-md border border-gray-100 max-h-32 overflow-y-auto">
                {designInfo.summary || 'N/A'}
              </div>
            </div>
          </section>
        </div>

        {/* 유사 디자인 검색 결과 */}
        <section className="mb-6 border border-gray-200 p-6 rounded-xl bg-white shadow-sm">
          <h3 className="font-semibold text-xl mb-4 text-gray-800 flex items-center gap-2">
            <Copy className="w-5 h-5 text-indigo-500" /> 유사 디자인 검색 결과
          </h3>
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-2 px-2">
            {reviewDetail.aiChecks && reviewDetail.aiChecks.length > 0 ? (
              reviewDetail.aiChecks.map((similar, index) => (
                <div key={index} className="min-w-[200px] w-full max-w-[250px] border border-gray-200 rounded-lg overflow-hidden bg-gray-50 shadow-sm flex-shrink-0">
                  <img src={`https://placehold.co/200x128/e2e8f0/64748b?text=Similar+Design+${index + 1}`} alt={`유사 디자인 ${index + 1}`} className="w-full h-32 object-cover bg-gray-200" />
                  <div className="p-3">
                    <p className="text-sm font-medium text-gray-800">관련 AI 체크: {similar}</p>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">AI 점검 결과 중 유사 디자인 관련 내용입니다.</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-600">유사 디자인 검색 결과가 없습니다.</p>
            )}
          </div>
        </section>

        {/* 최종 승인 버튼 */}
        <div className="text-center">
          <button
            onClick={handleFinalApproval}
            className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white rounded-xl font-bold text-lg transition-all flex items-center gap-3 mx-auto shadow-lg"
          >
            <CheckCircle className="w-6 h-6" />
            최종 출원 승인
          </button>
          
          {/* 목록으로 돌아가기 버튼 */}
          <button
            onClick={() => navigate('/designdashboard')}
            className="mt-4 px-6 py-3 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg font-medium transition-all flex items-center gap-2 mx-auto"
          >
            목록으로 돌아가기
          </button>
        </div>
      </div>

      {/* 사이드 챗봇 */}
      <div className={`fixed right-0 top-0 h-full w-[450px] bg-white shadow-2xl border-l border-gray-200 transform transition-transform duration-300 ease-in-out z-40 ${
        isChatOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        {/* 챗봇 헤더 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
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
            <button
              onClick={() => setIsChatOpen(false)}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        {/* 챗봇 내용 (isMinimized 조건문 없이 항상 렌더링) */}
          <>
            {/* 빠른 질문 버튼들 */}
            <div className="p-4 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-700 mb-3">빠른 질문</p>
              <div className="grid grid-cols-2 gap-2">
                {quickQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickQuestion(question.query)}
                    className="p-2 text-xs bg-gray-50 hover:bg-indigo-50 border border-gray-200 hover:border-indigo-300 rounded-lg transition-all flex flex-col items-center gap-1"
                  >
                    <question.icon className="w-4 h-4 text-indigo-600" />
                    <span className="text-gray-700">{question.text}</span>
                  </button>
                ))}
              </div>
            </div>
            {/* 채팅 메시지 영역 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ height: 'calc(95vh - 300px)' }}>
              {chatMessages.map((message) => (
                <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-lg ${
                    message.type === 'user' 
                      ? 'bg-indigo-500 text-white' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    <p className="text-sm whitespace-pre-line">{message.message}</p>
                    <p className={`text-xs mt-1 ${message.type === 'user' ? 'text-indigo-100' : 'text-gray-500'}`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
            {/* 메시지 입력 영역 */}
            <div className="p-4 border-t border-gray-200 bg-white" style={{ marginBottom: '60px' }}>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
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
              <p className="text-xs text-gray-500 mt-2">
                디자인 심사와 관련된 질문을 자유롭게 해보세요.
              </p>
            </div>
          </>
        
      
      </div>
      {/* 메인 콘텐츠에 오버레이 */}
      {isChatOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-20 z-30 lg:hidden"
          onClick={() => setIsChatOpen(false)}
        />
      )}
    </div>
  );
}
