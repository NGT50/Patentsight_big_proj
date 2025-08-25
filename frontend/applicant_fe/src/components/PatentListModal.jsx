import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// [수정] lucide-react 아이콘 이름들을 Heroicons에 맞는 이름으로 변경
import { DocumentTextIcon, ExclamationCircleIcon, CheckBadgeIcon, XMarkIcon } from '@heroicons/react/24/solid';

// API status 값을 화면에 표시할 한글로 변환해주는 도우미 객체
const statusMap = {
  DRAFT: '임시저장',
  SUBMITTED: '심사대기',
  REVIEWING: '심사중',
  APPROVED: '등록결정',
  REJECTED: '거절결정',
};

// 스켈레톤 UI 컴포넌트 (변경 없음)
const SkeletonCard = () => (
  <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-sm flex gap-4 animate-pulse">
    <div className="w-20 h-20 bg-gray-200 rounded-md"></div>
    <div className="flex-1 space-y-3 py-1">
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="h-3 bg-gray-200 rounded w-full"></div>
      <div className="h-3 bg-gray-200 rounded w-5/6"></div>
    </div>
  </div>
);

const PatentListModal = ({ onClose, patents, isLoading, isError, error }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('PATENT');

  const handleCardClick = (patentId) => {
    onClose();
    navigate(`/patent/${patentId}`);
  };

  const approvedPatents = patents?.filter(p => p.status === 'APPROVED') || [];

  const filteredPatents = approvedPatents.filter(patent => {
    if (activeTab === 'PATENT') {
      return patent.type === 'PATENT' || patent.type === 'UTILITY_MODEL';
    }
    if (activeTab === 'DESIGN') {
      return patent.type === 'DESIGN' || patent.type === 'TRADEMARK';
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60" onClick={onClose}>
      <div className="relative w-full max-w-4xl bg-gray-50 rounded-lg shadow-xl max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b bg-white rounded-t-lg">
          <h2 className="text-xl font-bold text-gray-800">🗃️ 특허 보관함</h2>
          <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        
        <div className="px-6 border-b border-gray-200 bg-white">
          <nav className="flex -mb-px space-x-8">
            <button onClick={() => setActiveTab('PATENT')} className={`py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'PATENT' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
              특허 / 실용신안
            </button>
            <button onClick={() => setActiveTab('DESIGN')} className={`py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'DESIGN' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
              디자인 / 상표
            </button>
          </nav>
        </div>

        <div className="p-6 overflow-y-auto">
          <div className="space-y-4">
            {isLoading && (
              <>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </>
            )}
            {isError && (
              <div className="text-center py-10 bg-white rounded-lg border border-red-200">
                {/* [수정] AlertCircle -> ExclamationCircleIcon */}
                <ExclamationCircleIcon className="w-12 h-12 text-red-400 mx-auto mb-3" />
                <p className="text-red-700 font-semibold">오류가 발생했습니다: {error.message}</p>
                <p className="text-sm text-gray-500 mt-1">데이터를 불러오는데 실패했습니다.</p>
              </div>
            )}
            
            {!isLoading && !isError && (
              filteredPatents.length === 0 ? (
                <div className="text-center py-10 bg-white rounded-lg border border-dashed">
                  {/* [수정] FileText -> DocumentTextIcon */}
                  <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-700 font-semibold">보관된 {activeTab === 'PATENT' ? '특허/실용신안' : '디자인/상표'}이 없습니다.</p>
                  <p className="text-sm text-gray-500 mt-1">출원이 등록결정되면 이곳에 보관됩니다.</p>
                </div>
              ) : (
                filteredPatents.map((patent) => (
                  <div 
                    key={patent.patentId} 
                    onClick={() => handleCardClick(patent.patentId)}
                    className="bg-white p-4 border border-gray-200 rounded-lg shadow-sm hover:shadow-lg hover:border-blue-400 transition-all cursor-pointer"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{patent.title}</h3>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600 mt-2">
                          <span><strong>출원번호:</strong> {patent.applicationNumber || '미부여'}</span>
                          <span>
                            <strong>출원일:</strong>{' '}
                            {(() => {
                              const displayDate =
                                patent.applicationDate ||
                                (patent.submittedAt ? patent.submittedAt.split('T')[0] : null);
                              return displayDate || '미지정';
                            })()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mt-1">
                          <strong>출원인:</strong> {patent.inventor}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 px-2.5 py-1 text-sm font-bold text-green-700 bg-green-100 rounded-full">
                        <CheckBadgeIcon className="w-5 h-5" />
                        <span>{statusMap[patent.status] || patent.status}</span>
                      </div>
                    </div>
                  </div>
                ))
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatentListModal;