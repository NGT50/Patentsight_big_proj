import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PatentCard from './PatentCard';

const PatentListModal = ({ onClose, patents, isLoading, isError, error }) => {
  const navigate = useNavigate();
  // 1. 활성 탭 관리를 위한 state ('PATENT' 또는 'DESIGN')
  const [activeTab, setActiveTab] = useState('PATENT');

  const handleCardClick = (patentId) => {
    navigate(`/patent/${patentId}`);
  };

  // 2. 활성 탭에 따라 전달받은 patents 목록을 필터링합니다.
  const filteredPatents = patents?.filter(patent => {
    if (activeTab === 'PATENT') {
      return patent.type === 'PATENT' || patent.type === 'UTILITY_MODEL';
    }
    if (activeTab === 'DESIGN') {
      return patent.type === 'DESIGN' || patent.type === 'TRADEMARK';
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
      <div className="relative w-full max-w-4xl bg-white rounded-lg shadow-xl max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-2xl font-bold text-gray-800">🗃️ 특허 보관함</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
        </div>
        
        {/* 3. 탭 UI를 추가합니다. */}
        <div className="px-6 border-b border-gray-200">
            <nav className="flex -mb-px space-x-8">
                <button onClick={() => setActiveTab('PATENT')} className={`py-4 text-sm font-medium border-b-2 ${activeTab === 'PATENT' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                    특허 / 실용신안
                </button>
                <button onClick={() => setActiveTab('DESIGN')} className={`py-4 text-sm font-medium border-b-2 ${activeTab === 'DESIGN' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                    디자인 / 상표
                </button>
            </nav>
        </div>

        <div className="p-8 overflow-y-auto">
            <div className="space-y-4">
            {isLoading && <p>출원 목록을 불러오는 중입니다...</p>}
            {isError && <p>오류가 발생했습니다: {error.message}</p>}
            
            {/* 4. 필터링된 목록을 렌더링합니다. */}
            {filteredPatents && filteredPatents.length === 0 && <p>해당 유형의 출원 내역이 없습니다.</p>}
            {filteredPatents && filteredPatents.map((p) => (
                <PatentCard key={p.patentId} data={p} onClick={handleCardClick} />
            ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default PatentListModal;