import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getMyPatents } from '../api/patents';
import { 
  FileText, 
  AlertCircle,
  FlaskConical,
  Eye,
  Plus,
} from 'lucide-react';
import SearchNavLink from '../components/SearchNavLink';
import PatentListModal from '../components/PatentListModal';

// API status 값을 화면에 표시할 한글로 변환해주는 도우미 객체
const statusMap = {
  DRAFT: '임시저장',
  SUBMITTED: '심사대기',
  IN_REVIEW: '심사중',
  APPROVED: '등록결정',
  REJECTED: '거절결정',
};


const MyPage = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // 1. react-query로 나의 모든 특허 데이터를 가져옵니다.
  const { data: allMyPatents, isLoading, isError, error } = useQuery({
    queryKey: ['myPatents'],
    queryFn: getMyPatents,
  });

  // 2. API 데이터로부터 화면에 필요한 값들을 계산합니다.
  const submittedPatentsList = allMyPatents?.filter(p => p.status !== 'DRAFT') || [];
  const patentDraftCount = allMyPatents?.filter(p => p.type === 'PATENT' && p.status === 'DRAFT').length || 0;
  const designDraftCount = allMyPatents?.filter(p => p.type === 'DESIGN' && p.status === 'DRAFT').length || 0;
  const totalSubmittedCount = submittedPatentsList.length;
  // TODO: '보완요청'에 해당하는 상태값으로 필터링해야 합니다.
  const needsActionCount = 1; 

  const handleCardClick = (patentId) => {
    navigate(`/patent/${patentId}`);
  };

  const openPatentListModal = () => setIsModalOpen(true);
  const closePatentListModal = () => setIsModalOpen(false);

  // --- UI 렌더링 ---
  return (
    <>
      {isModalOpen && (
        <PatentListModal 
          onClose={closePatentListModal}
          patents={submittedPatentsList}
          isLoading={isLoading}
          isError={isError}
          error={error}
        />
      )}

      <div className="max-w-screen-xl mx-auto px-4 py-8">
        
        {/* 환영 메시지 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">AI와 함께, 출원부터 보완까지 손쉽게</h1>
          <p className="text-gray-600">Patentsight AI 어시스턴트가 복잡한 특허 출원 과정을 도와드립니다.</p>
        </div>

        {/* 대화형 검색 링크 */}
        <SearchNavLink />

        {/* [수정] 그리드 레이아웃을 제거하여 메인 컨텐츠가 전체 너비를 사용하도록 변경 */}
        <div className="mt-8 space-y-8">
          {/* 빠른 기능 버튼 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">바로가기</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button onClick={() => navigate('/check/patents')} className="flex flex-col items-center justify-center p-4 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-all group h-full">
                <FlaskConical className="w-8 h-8 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-blue-800 text-center">특허·실용신안 점검</span>
                <span className="text-xs text-blue-600 mt-1">({patentDraftCount}건 임시저장)</span>
              </button>
              <button onClick={() => navigate('/check/designs')} className="flex flex-col items-center justify-center p-4 bg-purple-50 rounded-lg border border-purple-200 hover:bg-purple-100 transition-all group h-full">
                <Eye className="w-8 h-8 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-purple-800 text-center">디자인·상표 점검</span>
                <span className="text-xs text-purple-600 mt-1">({designDraftCount}건 임시저장)</span>
              </button>
              <button onClick={openPatentListModal} className="flex flex-col items-center justify-center p-4 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-all group h-full">
                <FileText className="w-8 h-8 text-green-600 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-green-800 text-center">특허 보관함</span>
                <div className="text-xs text-green-600 mt-1 text-center">
                  <div>총 출원수: {totalSubmittedCount}건</div>
                  <div>보완요청: {needsActionCount}건</div>
                </div>
              </button>
              <button onClick={() => navigate('/new-patent-choice')} className="flex flex-col items-center justify-center p-4 bg-orange-50 rounded-lg border border-orange-200 hover:bg-orange-100 transition-all group h-full">
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
            
            {!isLoading && !isError && submittedPatentsList.length === 0 && (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">출원 내역이 없습니다.</p>
              </div>
            )}
            
            {submittedPatentsList.length > 0 && (
              <div className="space-y-4">
                {submittedPatentsList.map((patent) => (
                  <div
                    key={patent.patentId}
                    onClick={() => handleCardClick(patent.patentId)}
                    className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer bg-gradient-to-r from-gray-50 to-white"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{patent.title}</h3>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
                          <span><strong>출원번호:</strong> {patent.applicationNumber || '미부여'}</span>
                          <span><strong>출원일:</strong> {patent.applicationDate || '미지정'}</span>
                          <span><strong>IPC:</strong> {patent.ipc || 'N/A'}</span>
                          <span><strong>CPC:</strong> {patent.cpc || 'N/A'}</span>
                        </div>
                        <p className="text-sm text-gray-700 mt-2">
                          <strong>출원인:</strong> {patent.inventor} | 
                          <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                            patent.status === 'IN_REVIEW' ? 'bg-yellow-100 text-yellow-800' :
                            patent.status === 'SUBMITTED' ? 'bg-blue-100 text-blue-800' :
                            patent.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                            patent.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {statusMap[patent.status] || patent.status}
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
      </div>
    </>
  );
};

export default MyPage;