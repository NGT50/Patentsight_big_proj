import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// 필요한 모든 Lucide React 아이콘을 임포트합니다. 챗봇 관련 아이콘 추가
import { 
  Info, FileText, Image, MessageSquare, Copy, FlaskConical, 
  CheckCircle, XCircle, Send, Bot, Maximize2, Minimize2, Lightbulb, GanttChart, Scale, X 
} from 'lucide-react'; 
import Header from '../components/Header';
import { patentDetailMockData } from '../mocks/patentDetailMock';
import ThreeDModelViewer from '../components/ThreeDModelViewer';

export default function PatentReview() {
  const { id } = useParams(); // URL 파라미터에서 ID를 가져옵니다.
  const navigate = useNavigate();

  const patent = patentDetailMockData[id];

  // 심사 의견 관련 상태
  const [reviewType, setReviewType] = useState('approval'); // 'approval' 또는 'rejection'
  const [approvalComment, setApprovalComment] = useState('');
  const [rejectionComment, setRejectionComment] = useState('');
  const [status, setStatus] = useState(patent?.status || '심사대기');

  // 챗봇 관련 상태
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // 빠른 질문 버튼 데이터
  const quickQuestions = [
    { text: '유사 특허', icon: Copy, query: '유사 특허' },
    { text: '진보성', icon: Lightbulb, query: '진보성' },
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

    // 봇 응답 시뮬레이션
    setTimeout(() => {
      const responses = {
        '유사 특허': `${patent.title}과 관련된 유사 특허를 분석해보니, 다음과 같은 특허들이 발견되었습니다:\n1. 특허번호 2023-000123: "음성 인식 기반 스마트 어시스턴트"\n   - 유사점: 음성 인식 기술 사용\n   - 차이점: IoT 기기 제어에 특화, 실시간 번역 기능 없음\n2. 특허번호 2023-000456: "실시간 음성 번역 장치"\n     - 유사점: 실시간 번역 기능\n     - 차이점: 딥러닝 기반 노이즈 제거 기술 미포함\n현재 출원의 진보성이 인정될 가능성이 높습니다.`,
        '진보성': `이 발명의 기술적 진보성을 다음 관점에서 검토해보세요:\n**신규성 (Novelty)**\n- 딥러닝 + 실시간 번역 + 노이즈 제거의 결합이 새로운가?\n- 기존 선행기술과의 명확한 차이점 존재\n**진보성 (Inventive Step)**\n  - 정확도 30% 향상은 통상의 기술자가 쉽게 도달할 수 없는 수준\n- 다양한 환경에서의 안정성은 기술적 난제 해결\n**산업상 이용가능성**\n- 음성 인식, 번역 서비스, AI 어시스턴트 등 다방면 활용 가능\n권장사항: 등록 결정이 적절해 보입니다.`,
        '법적 근거': `특허법 관련 조항을 검토해드립니다:\n**특허법 제29조 (특허요건)**\n1. 산업상 이용할 수 있는 발명 - ✅ 충족\n2. 신규성 - ✅ 기존 기술과 차별화됨\n3. 진보성 - ✅ 기술적 진보 명확\n**특허법 제42조 (특허출원서의 기재사항)**\n- 청구범위가 명확하고 간결하게 기재 - ✅ 확인 필요\n- 발명의 상세한 설명 - ✅ 충분히 기재됨\n**특허법 제136조 (거절결정)**\n거절 사유에 해당하지 않으므로 등록 결정 권장`,
        '심사 기준': `AI/딥러닝 관련 발명의 심사 기준:\n**기술적 특징 명확성**\n- 알고리즘의 구체적 구현 방법 기재 ✅\n- 하드웨어와의 연계성 명시 ✅\n**효과의 구체성**\n  - 정량적 성능 향상 (30% 정확도 개선) ✅\n- 기존 기술 대비 우수성 입증 ✅\n**청구범위 적정성**\n- 과도한 권리범위 주장 여부 검토 필요\n- 핵심 기술적 특징 포함 여부 ✅\n권장사항: 현재 출원은 심사 기준을 잘 충족하고 있습니다.`
      };
      let botResponse = "죄송합니다. 더 구체적인 질문을 해주시면 도움을 드릴 수 있습니다.";

      // 키워드 매칭으로 응답 선택
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

  // 특허 데이터가 없을 경우 처리 및 대시보드로 리다이렉트
  useEffect(() => {
    if (!patent) {
      alert('특허 정보를 찾을 수 없습니다. 목록으로 돌아갑니다.');
      navigate('/patentdashboard');
    }
  }, [patent, navigate]);

  const getStatusColorClass = (currentStatus) => {
    switch (currentStatus) {
      case '심사중': return 'bg-yellow-100 text-yellow-800';
      case '심사완료': return 'bg-green-100 text-green-700';
      case '심사대기': return 'bg-blue-100 text-blue-800';
      case '거절': return 'bg-red-100 text-red-700';
      case '등록결정': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleReviewSubmit = () => {
    const currentComment = reviewType === 'approval' ? approvalComment : rejectionComment;
    
    if (currentComment.trim() === '') {
      alert(`${reviewType === 'approval' ? '의견서' : '거절사유서'}를 입력해주세요.`);
      return;
    }

    const newStatus = reviewType === 'approval' ? '등록결정' : '거절';
    console.log(`특허 ${id}에 대한 ${reviewType === 'approval' ? '승인 의견' : '거절 사유'} 제출:`, currentComment);
    console.log(`새로운 상태:`, newStatus);
    alert(`${reviewType === 'approval' ? '의견서' : '거절사유서'}가 제출되었습니다!`);
    
    setStatus(newStatus);
  };

  const handleFinalApproval = () => {
    if (approvalComment.trim() === '' && rejectionComment.trim() === '') {
      alert('의견서 또는 거절사유서 중 하나는 작성되어야 합니다.');
      return;
    }
    
    console.log('최종 출원 승인 처리');
    alert('출원이 최종 승인되었습니다!');
    setStatus('등록결정');
  };

  // patent가 없을 경우, useEffect에 의해 리다이렉트될 것이므로 이 컴포넌트는 null을 반환하여 렌더링을 중단
  if (!patent) {
    return null; 
  }

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen relative">
      {/* Header */}
      <Header/>
      <div className="bg-white shadow-sm border-b">
        <div className="px-8 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-800">
            <FlaskConical className="w-7 h-7 text-blue-600"/> 
            <span>특허 심사 의견서</span>
          </h2>
          
          {/* 챗봇 토글 버튼 - 위치 개선 */}
          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className={`fixed right-8 bottom-8 z-50 p-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 ${
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
            <Info className="w-5 h-5 text-blue-500" /> 출원 정보
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-3 text-gray-700">
            <p><strong>출원번호:</strong> <span className="font-medium text-gray-900">{patent.id}</span></p>
            <p><strong>접수일자:</strong> <span className="font-medium text-gray-900">{patent.receptionDate}</span></p>
            <p><strong>출원인:</strong> <span className="font-medium text-gray-900">{patent.applicant}</span></p>
            <p><strong>특허명:</strong> <span className="font-medium text-gray-900">{patent.title}</span></p>
            <p>
              <strong>심사상태:</strong> 
              <span className={`font-semibold ${getStatusColorClass(status)} px-2 py-1 rounded text-sm ml-2`}>
                {status}
              </span>
            </p>
            <p><strong>분류:</strong> <span className="font-medium text-gray-900">{patent.field}</span></p>
            <p><strong>담당 심사관:</strong> <span className="font-medium text-gray-900">{patent.examiner}</span></p>
          </div>
        </section>

        {/* 2열 레이아웃: 좌측 의견서 작성, 우측 심사 대상 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* 좌측: 심사 의견 작성 */}
          <section className="border border-gray-200 p-5 rounded-xl bg-white shadow-sm">
            <h3 className="font-semibold text-xl mb-4 text-gray-800 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-500" /> 심사 의견 작성
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
                    의견서 (승인)
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
                    거절사유서
                  </span>
                </label>
              </div>
            </div>

            {/* 승인 의견서 작성 */}
            {reviewType === 'approval' && (
              <div className="mb-4 w-full">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  승인 의견서 작성
                </label>
                <textarea
                  rows={16}
                  className="w-full border border-gray-300 px-4 py-3 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-y"
                  placeholder="등록 결정 이유 및 특허의 진보성, 신규성에 대한 의견을 작성해주세요.

예시:
- 본 발명은 기존 기술 대비 명확한 기술적 진보성을 보임
- 선행기술과의 차별점이 명확히 기재되어 있음
- 청구항이 명확하고 구체적으로 작성됨"
                  value={approvalComment}
                  onChange={(e) => setApprovalComment(e.target.value)}
                />
              </div>
            )}

            {/* 거절사유서 작성 */}
            {reviewType === 'rejection' && (
              <div className="mb-4 w-full">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  거절사유서 작성
                </label>
                <textarea
                  rows={16}
                  className="w-full border border-gray-300 px-4 py-3 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all resize-y"
                  placeholder="거절 이유를 구체적으로 작성해주세요.

예시:
- 선행기술 문헌: [문헌명, 공개번호]
- 신규성/진보성 결여 사유
- 청구항의 불명확성
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
                {reviewType === 'approval' ? '의견서 제출' : '거절사유서 제출'}
              </button>
            </div>
          </section>

          {/* 우측: 심사 대상 */}
          <section className="border border-gray-200 p-6 rounded-xl bg-white shadow-sm">
            <h3 className="font-semibold text-xl mb-4 flex items-center gap-2 text-gray-800">
              <FileText className="w-5 h-5 text-blue-500" /> 심사 대상
            </h3>
            
            <div className="mb-4">
              <h4 className="font-medium text-lg mb-2 text-gray-800 flex items-center gap-1">
                <FileText className="w-4 h-4 text-blue-400" /> 청구항
              </h4>
              {patent.claims && patent.claims.length > 0 ? (
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 bg-gray-50 p-3 rounded-md border border-gray-100 max-h-32 overflow-y-auto">
                  {patent.claims.map((claim, index) => (
                    <li key={index}>{claim}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded-md border border-gray-100">등록된 청구항이 없습니다.</p>
              )}
            </div>

            {/* 2D 도면과 3D 모델을 좌우로 배치 */}
            <div className="flex flex-col lg:flex-row gap-6 mb-4">
              {/* 2D 도면 섹션 */}
              <div className={`flex-1 ${patent.modelPath ? 'lg:w-1/2' : 'w-full'}`}>
                <h4 className="font-medium text-lg mb-2 text-gray-800 flex items-center gap-1">
                  <Image className="w-4 h-4 text-blue-400" /> 2D 도면
                </h4>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {patent.images && patent.images.length > 0 ? (
                    patent.images.map((imagePath, index) => (
                      <div key={index} className="border border-gray-200 rounded-md overflow-hidden bg-white shadow-sm">
                        <img src={imagePath} alt={`특허 도면 ${index + 1}`} className="w-full h-20 object-cover bg-gray-200" />
                        <p className="p-1 text-center text-xs text-gray-600 border-t border-gray-100">도면 {index + 1}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-600 col-span-full text-sm bg-gray-50 p-3 rounded-md border border-gray-100">등록된 2D 도면이 없습니다.</p>
                  )}
                </div>
              </div>

              {/* 3D GLB 모델 섹션 */}
              {patent.modelPath && (
                <div className="flex-1 lg:w-1/2 mt-6 lg:mt-0">
                  <h4 className="font-medium text-lg mb-2 text-gray-800 flex items-center gap-1">
                    <FlaskConical className="w-4 h-4 text-blue-400" /> 3D 특허 모델
                  </h4>
                    <ThreeDModelViewer glbPath={patent.modelPath} />
                </div>
              )}
              {!patent.modelPath && patent.images && patent.images.length > 0 && (
                <div className="flex-1 lg:w-1/2 mt-6 lg:mt-0">
                  <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded-md border border-gray-100 h-full flex items-center justify-center">
                    등록된 3D 모델이 없습니다.
                  </p>
                </div>
              )}
            </div>

            <div>
              <h4 className="font-medium text-lg mb-2 text-gray-800 flex items-center gap-1">
                <FileText className="w-4 h-4 text-blue-400" /> 요약
              </h4>
              <div className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-md border border-gray-100 max-h-32 overflow-y-auto">
                {patent.description}
              </div>
            </div>
          </section>
        </div>

        {/* 유사 특허 검색 결과 */}
        <section className="mb-6 border border-gray-200 p-6 rounded-xl bg-white shadow-sm">
          <h3 className="font-semibold text-xl mb-4 text-gray-800 flex items-center gap-2">
            <Copy className="w-5 h-5 text-blue-500" /> 유사 특허 검색 결과
          </h3>
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-2 px-2">
            {patent.relatedPatents && patent.relatedPatents.length > 0 ? (
              patent.relatedPatents.map((similar, index) => (
                <div key={index} className="min-w-[200px] w-full max-w-[250px] border border-gray-200 rounded-lg overflow-hidden bg-gray-50 shadow-sm flex-shrink-0">
                  <img src={similar.image} alt={similar.title} className="w-full h-32 object-cover bg-gray-200" />
                  <div className="p-3">
                    <p className="text-sm font-medium text-gray-800">특허번호: {similar.id}</p>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">{similar.description}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-600">유사 특허 검색 결과가 없습니다.</p>
            )}
          </div>
        </section>

        {/* 최종 승인 버튼 */}
        <div className="text-center">
          <button
            onClick={handleFinalApproval}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-xl font-bold text-lg transition-all flex items-center gap-3 mx-auto shadow-lg"
          >
            <CheckCircle className="w-6 h-6" />
            최종 출원 승인
          </button>
          
          {/* 목록으로 돌아가기 버튼 */}
          <button
            onClick={() => navigate('/patentdashboard')}
            className="mt-4 px-6 py-3 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg font-medium transition-all flex items-center gap-2 mx-auto"
          >
            목록으로 돌아가기
          </button>
        </div>
      </div>

      {/* 사이드 챗봇 - 크기와 레이아웃 개선 */}
      <div className={`fixed right-0 top-0 h-full w-[450px] bg-white shadow-2xl border-l border-gray-200 transform transition-transform duration-300 ease-in-out z-40 ${
        isChatOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        {/* 챗봇 헤더 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
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
            <button
              onClick={() => setIsChatOpen(false)}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        {!isMinimized && (
          <>
            {/* 빠른 질문 버튼들 */}
            <div className="p-4 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-700 mb-3">빠른 질문</p>
              <div className="grid grid-cols-2 gap-2">
                {quickQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickQuestion(question.query)}
                    className="p-2 text-xs bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg transition-all flex flex-col items-center gap-1"
                  >
                    <question.icon className="w-4 h-4 text-blue-600" />
                    <span className="text-gray-700">{question.text}</span>
                  </button>
                ))}
              </div>
            </div>
            {/* 채팅 메시지 영역 - 높이 개선 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ height: 'calc(95vh - 300px)' }}>
              {chatMessages.map((message) => (
                <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-lg ${
                    message.type === 'user' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    <p className="text-sm whitespace-pre-line">{message.message}</p>
                    <p className={`text-xs mt-1 ${message.type === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
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
            {/* 메시지 입력 영역 - 위치와 높이 개선 */}
            <div className="p-4 border-t border-gray-200 bg-white" style={{ marginBottom: '60px' }}>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
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
              <p className="text-xs text-gray-500 mt-2">
                특허 심사와 관련된 질문을 자유롭게 해보세요.
              </p>
            </div>
          </>
        )}
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