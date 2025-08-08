import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getMyPatents } from '../api/patents';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  FlaskConical,
  Eye,
  Plus,
  Bell
} from 'lucide-react';
import { getNotifications } from '../data/notifications';

// 병합된 컴포넌트들을 import 합니다.
import SearchNavLink from '../components/SearchNavLink';
import PatentListModal from '../components/PatentListModal';

const MyPage = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Mock 데이터 (테스트용)
  const mockPatents = [
    { 
      patentId: 101, 
      title: '첫 번째 테스트 특허: 스마트 잠금장치',
      status: '심사중',
      applicant: '홍길동',
      applicationDate: '2024-01-15',
      ipc: 'E05B 47/00',
      cpc: 'E05B2047/0012',
      summary: 'IoT 기반 스마트 잠금 시스템'
    },
    { 
      patentId: 102, 
      title: '두 번째 테스트 특허: AI 기반 번역 시스템',
      status: '심사대기',
      applicant: '김철수',
      applicationDate: '2024-02-20',
      ipc: 'G06F 17/28',
      cpc: 'G06F40/58',
      summary: '실시간 다국어 번역 AI 시스템'
    },
  ];
  
  const patents = mockPatents;
  const isLoading = false;
  const isError = false;
  const error = null;

  // 알림 데이터 로드
  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setIsLoadingNotifications(true);
    try {
      const notificationData = await getNotifications();
      setNotifications(notificationData);
    } catch (error) {
      console.error('알림 데이터 로드 실패:', error);
      setNotifications([]);
    } finally {
      setIsLoadingNotifications(false);
    }
  };

  const handleCardClick = (patentId) => {
    navigate(`/patent/${patentId}`);
  };

  // '특허 보관함'을 위한 데이터 호출 (모달이 열릴 때만 실행)
  const { 
    data: submittedPatents, 
    isLoading: isLoadingSubmitted, 
    isError: isErrorSubmitted, 
    error: errorSubmitted 
  } = useQuery({
    queryKey: ['mySubmittedPatents'],
    queryFn: () => getMyPatents({ 'status_ne': 'DRAFT' }),
    enabled: isModalOpen,
  });

  // 'DRAFT' 상태의 문서 개수 (점검 페이지용) - 예시
  // 실제로는 이 데이터도 API로 받아와야 합니다.
  const patentDraftCount = 3; 
  const designDraftCount = 1;

  const openPatentListModal = () => setIsModalOpen(true);
  const closePatentListModal = () => setIsModalOpen(false);

  // --- UI 렌더링 (develop-fe2 디자인 기반 + jw-front 기능) ---
  return (
    <>
      {/* '특허 보관함' 모달 렌더링 (jw-front 기능) */}
      {isModalOpen && (
        <PatentListModal 
          onClose={closePatentListModal}
          patents={submittedPatents}
          isLoading={isLoadingSubmitted}
          isError={isErrorSubmitted}
          error={errorSubmitted}
        />
      )}

      <div className="max-w-screen-xl mx-auto px-4 py-8">
        
        {/* 환영 메시지 (develop-fe2 디자인) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">AI와 함께, 출원부터 보완까지 손쉽게</h1>
          <p className="text-gray-600">Patentsight AI 어시스턴트가 복잡한 특허 출원 과정을 도와드립니다.</p>
        </div>

        {/* 대화형 검색 링크 (jw-front 기능) */}
        <SearchNavLink />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 메인 기능 섹션 */}
          <div className="lg:col-span-2">
            {/* 빠른 기능 버튼 (develop-fe2 디자인 + jw-front 네비게이션) */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">바로가기</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button onClick={() => navigate('/check/patents')} className="flex flex-col items-center p-4 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-all group">
                  <FlaskConical className="w-8 h-8 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium text-blue-800 text-center">특허·실용신안 점검</span>
                  <span className="text-xs text-blue-600 mt-1">({patentDraftCount}건 임시저장)</span>
                </button>
                <button onClick={() => navigate('/check/designs')} className="flex flex-col items-center p-4 bg-purple-50 rounded-lg border border-purple-200 hover:bg-purple-100 transition-all group">
                  <Eye className="w-8 h-8 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium text-purple-800 text-center">디자인·상표 점검</span>
                  <span className="text-xs text-purple-600 mt-1">({designDraftCount}건 임시저장)</span>
                </button>
                <button onClick={openPatentListModal} className="flex flex-col items-center p-4 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-all group">
                  <FileText className="w-8 h-8 text-green-600 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium text-green-800 text-center">특허 보관함</span>
                  <div className="text-xs text-green-600 mt-1">
                    <div>총 출원수: 3건</div>
                    <div>보완요청: 1건</div>
                  </div>
                </button>
                <button onClick={() => navigate('/patents/new')} className="flex flex-col items-center p-4 bg-orange-50 rounded-lg border border-orange-200 hover:bg-orange-100 transition-all group">
                  <Plus className="w-8 h-8 text-orange-600 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium text-orange-800 text-center">출원서 등록</span>
                </button>
              </div>
            </div>

            {/* 출원 목록 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">📄 나의 출원 목록</h2>
              
              {isLoading && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 mt-2">출원 목록을 불러오는 중입니다...</p>
                </div>
              )}
              
              {isError && (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-2" />
                  <p className="text-red-600">오류가 발생했습니다: {error?.message}</p>
                </div>
              )}
              
              {patents && patents.length === 0 && (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">출원 내역이 없습니다.</p>
                </div>
              )}
              
              {patents && patents.length > 0 && (
                <div className="space-y-4">
                  {patents.map((patent) => (
                    <div
                      key={patent.patentId}
                      onClick={() => handleCardClick(patent.patentId)}
                      className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer bg-gradient-to-r from-gray-50 to-white"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {patent.title}
                          </h3>
                          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                            <span><strong>출원번호:</strong> {patent.patentId}</span>
                            <span><strong>출원일:</strong> {patent.applicationDate}</span>
                            <span><strong>IPC:</strong> {patent.ipc}</span>
                            <span><strong>CPC:</strong> {patent.cpc}</span>
                          </div>
                          <p className="text-sm text-gray-700 mt-1">
                            <strong>출원인:</strong> {patent.applicant} | 
                            <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                              patent.status === '심사중' ? 'bg-yellow-100 text-yellow-800' :
                              patent.status === '심사대기' ? 'bg-blue-100 text-blue-800' :
                              patent.status === '심사완료' ? 'bg-green-100 text-green-700' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {patent.status}
                            </span>
                          </p>
                          <p className="mt-2 text-sm text-gray-600">📌 <em>{patent.summary}</em></p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 알림 패널 (develop-fe2 디자인) */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Bell className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-bold text-gray-800">최근 알림</h3>
              </div>
              <div className="space-y-4">
                {isLoadingNotifications ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-500 text-sm mt-2">알림을 불러오는 중...</p>
                  </div>
                ) : notifications && notifications.length > 0 ? (
                  notifications.map((notification, index) => (
                    <div
                      key={notification.id || index}
                      className={`p-3 rounded-lg border ${
                        notification.type === 'warning' 
                          ? 'bg-red-50 border-red-200' 
                          : notification.type === 'success'
                          ? 'bg-green-50 border-green-200'
                          : 'bg-blue-50 border-blue-200'
                      }`}
                    >
                      <p className={`text-sm font-medium ${
                        notification.type === 'warning' 
                          ? 'text-red-800' 
                          : notification.type === 'success'
                          ? 'text-green-800'
                          : 'text-blue-800'
                      }`}>
                        {notification.message}
                      </p>
                      {notification.deadline && (
                        <p className={`text-xs mt-1 ${
                          notification.type === 'warning' 
                            ? 'text-red-600' 
                            : notification.type === 'success'
                            ? 'text-green-600'
                            : 'text-blue-600'
                        }`}>
                          기한: {notification.deadline}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <Bell className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">새로운 알림이 없습니다.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MyPage;