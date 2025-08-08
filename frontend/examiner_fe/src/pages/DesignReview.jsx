import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Palette, Info, Image, MessageSquare, Copy, FlaskConical,
  CheckCircle, XCircle, Send, Bot, Lightbulb, GanttChart, Scale, X, FileText, ScrollText, Check
} from 'lucide-react';

import { submitReview, getReviewDetail } from '../api/review';

// 가상의 3D 모델 뷰어 컴포넌트
const ThreeDModelViewer = ({ glbPath }) => {
  return (
    <div className="w-full h-72 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center border border-gray-200">
      <p className="text-gray-500 text-sm">3D 모델 뷰어: {glbPath}</p>
    </div>
  );
};

export default function App() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [design, setDesign] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [selectedAction, setSelectedAction] = useState('document');
  const [approvalComment, setApprovalComment] = useState('');
  const [rejectionComment, setRejectionComment] = useState('');
  const [status, setStatus] = useState('심사대기');
  const [approvalDocumentText, setApprovalDocumentText] = useState('');

  // 챗봇 관련 상태
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // 커스텀 메시지 박스 상태
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  const quickQuestions = [
    { text: '유사 디자인', icon: Copy, query: '유사 디자인' },
    { text: '심미성', icon: Lightbulb, query: '심미성' },
    { text: '법적 근거', icon: Scale, query: '법적 근거' },
    { text: '심사 기준', icon: GanttChart, query: '심사 기준' },
  ];

  // API 데이터 로딩 로직
  useEffect(() => {
    const fetchReviewData = async () => {
      setLoading(true);
      try {
        const data = await getReviewDetail(id);
        setDesign(data);

        let translatedStatus = '';
        switch (data.decision) {
          case 'APPROVE':
            translatedStatus = '심사완료';
            setSelectedAction('document');
            setApprovalComment(data.comment);
            break;
          case 'REJECT':
            translatedStatus = '거절';
            setSelectedAction('rejection');
            setRejectionComment(data.comment);
            break;
          case 'PENDING':
          default:
            translatedStatus = '심사대기';
            break;
        }
        setStatus(translatedStatus);

      } catch (error) {
        console.error('심사 상세 정보 조회 실패:', error);
        navigate('/designdashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchReviewData();
  }, [id, navigate]);

  // 챗봇 메시지 전송 로직
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

    const chatHistory = [{ role: 'user', parts: [{ text: message }] }];
    const payload = { contents: chatHistory };
    const apiKey = ""; // 여기에 Gemini API 키를 입력하세요.
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      const botResponse = result?.candidates?.[0]?.content?.parts?.[0]?.text || "죄송합니다. 답변을 생성하는 데 문제가 발생했습니다.";
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        message: botResponse,
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("Failed to fetch response from bot API:", error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        message: "죄송합니다. AI 도우미와 연결하는 데 문제가 발생했습니다.",
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickQuestion = (query) => {
    sendChatMessage(query);
  };

  const getStatusColorClass = (currentStatus) => {
    switch (currentStatus) {
      case '심사완료':
      case '등록결정':
        return 'bg-green-100 text-green-700';
      case '심사대기':
        return 'bg-blue-100 text-blue-800';
      case '심사중':
        return 'bg-yellow-100 text-yellow-800';
      case '거절':
        return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const showMessageBox = (message) => {
    setModalMessage(message);
    setShowModal(true);
  };

  // API 제출 로직 수정
  const handleReviewSubmit = async () => {
    let currentComment;
    let decision;
    let message;
    let newStatus;

    if (selectedAction === 'document') {
        currentComment = approvalComment;
        decision = 'PENDING';
        newStatus = '심사중';
        message = '의견서가 제출되었습니다. 상태가 "심사중"으로 변경됩니다.';
    } else if (selectedAction === 'rejection') {
        currentComment = rejectionComment;
        decision = 'REJECT';
        newStatus = '거절';
        message = '거절사유서가 제출되었습니다. 상태가 "거절"으로 변경됩니다.';
    } else {
        return;
    }

    if (!currentComment || !currentComment.trim()) {
        showMessageBox('의견을 입력해주세요.');
        return;
    }

    const requestData = {
        patentId: design.patentId,
        decision: decision,
        comment: currentComment
    };

    console.log('Submitting data to API:', requestData);

    try {
        const response = await submitReview(requestData);
        console.log('심사 제출 결과:', response);
        setStatus(newStatus);
        showMessageBox(message);
    } catch (error) {
        console.error('심사 제출 실패:', error);
        showMessageBox('심사 제출에 실패했습니다. 다시 시도해 주세요.');
    }
  };

  // 최종 승인 서류 초안 생성 함수
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

  // 최종 승인 제출 함수
  const handleFinalizeApproval = async () => {
      const requestData = {
        patentId: design.patentId,
        decision: 'APPROVE',
        comment: approvalDocumentText || '최종 등록 승인됨.'
      };
      
      console.log('Finalizing approval with data:', requestData);

      try {
        const response = await submitReview(requestData);
        console.log('최종 승인 결과:', response);
        setStatus('심사완료');
        showMessageBox('디자인이 최종 승인 처리되었습니다.');
      } catch (error) {
        console.error('최종 승인 실패:', error);
        showMessageBox('최종 승인 처리에 실패했습니다.');
      }
  };

  const handleDocumentCheck = () => {
    showMessageBox('출원 서류를 점검 중입니다... (시뮬레이션)\n\n서류에 특별한 오류는 발견되지 않았습니다.');
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
    return null;
  }
  
  const isFinalStatus = status === '심사완료' || status === '거절';

  return (
    <div className="bg-gradient-to-br from-slate-50 via-gray-50 to-gray-50 min-h-screen relative font-sans">
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
              <span className={`font-semibold ${getStatusColorClass(status)} px-2 py-1 rounded text-sm ml-2`}>
                {status}
              </span>
            </p>
            <p><strong>분류:</strong> <span className="font-medium text-gray-900">{design.technicalField}</span></p>
            <p><strong>담당 심사관:</strong> <span className="font-medium text-gray-900">{design.examinerName || '정보 없음'}</span></p>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {selectedAction === 'document' ? '보류 의견서 작성' : selectedAction === 'rejection' ? '거절 사유서 작성' : '최종 승인 서류'}
                </label>
                <textarea
                  rows={16}
                  disabled={isFinalStatus}
                  className="w-full border border-gray-300 px-4 py-3 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-y disabled:bg-gray-100"
                  placeholder={
                    selectedAction === 'document' ? `보류 사유 및 보완이 필요한 사항에 대해 작성해주세요.` :
                    selectedAction === 'rejection' ? `거절 이유를 구체적으로 작성해주세요.` : ''
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

          <section className="border border-gray-200 p-6 rounded-xl bg-white shadow-sm">
            <h3 className="font-semibold text-xl mb-4 flex items-center gap-2 text-gray-800">
              <FileText className="w-5 h-5 text-indigo-500" /> 심사 대상
              <button
                onClick={handleDocumentCheck}
                className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium ml-auto transition-colors flex items-center gap-2 text-sm"
              >
                <ScrollText className="w-4 h-4" />
                출원서류 점검
              </button>
            </h3>
            
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
                <p className="text-gray-600 col-span-full text-sm bg-gray-50 p-3 rounded-md border border-gray-100">등록된 청구항이 없습니다.</p>
              )}
            </div>

            <div className="flex flex-col lg:flex-row gap-6 mb-4">
              <div className="flex-1 w-full">
                <h4 className="font-medium text-lg mb-2 text-gray-800 flex items-center gap-1">
                  <Image className="w-4 h-4 text-indigo-400" /> 2D 도면
                </h4>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  <p className="text-gray-600 col-span-full text-sm bg-gray-50 p-3 rounded-md border border-gray-100">등록된 2D 도면이 없습니다.</p>
                </div>
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-md border border-gray-100 max-h-32 overflow-y-auto">
                {design.summary}
              </div>
            </div>
          </section>
        </div>

        <section className="mb-6 border border-gray-200 p-6 rounded-xl bg-white shadow-sm">
          <h3 className="font-semibold text-xl mb-4 text-gray-800 flex items-center gap-2">
            <Copy className="w-5 h-5 text-indigo-500" /> AI 유사 디자인 분석
          </h3>
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-2 px-2">
            {design.aiChecks && design.aiChecks.length > 0 ? (
              design.aiChecks.map((check, index) => (
                <div key={index} className="min-w-[200px] w-full max-w-[250px] border border-gray-200 rounded-lg overflow-hidden bg-gray-50 shadow-sm flex-shrink-0">
                  <div className="p-3">
                    <p className="text-sm font-medium text-gray-800">분석 결과 {index + 1}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-600">AI 분석 결과가 없습니다.</p>
            )}
          </div>
        </section>

        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/designdashboard')}
            className="px-6 py-3 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg font-medium transition-all flex items-center gap-2 mx-auto"
          >
            목록으로 돌아가기
          </button>
        </div>
      </div>

      {/* [수정] 챗봇 UI 전체 구조 수정 */}
      <div className={`fixed right-0 top-0 h-full w-[450px] bg-white shadow-2xl border-l border-gray-200 transform transition-transform duration-300 ease-in-out z-40 flex flex-col ${
        isChatOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
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
            <button
              onClick={() => setIsChatOpen(false)}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div className="p-4 border-b border-gray-100 flex-shrink-0">
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
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
        
        <div className="p-4 border-t border-gray-200 bg-white flex-shrink-0">
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
        </div>
      </div>
      
      {isChatOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-20 z-30"
          onClick={() => setIsChatOpen(false)}
        />
      )}

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
