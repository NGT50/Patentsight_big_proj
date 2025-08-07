import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getMyPatents } from '../api/patents';

import TopBar from '../components/TopBar';
import FeatureGrid from '../components/FeatureGrid';
import NotificationPanel from '../components/NotificationPanel';
import SearchNavLink from '../components/SearchNavLink';
import PatentListModal from '../components/PatentListModal';

const MyPage = () => {
  const navigate = useNavigate();

  // 1. 모든 useState 훅(상태 선언)을 컴포넌트 최상단에 배치합니다.
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  // 2. 선언된 state 변수(isModalOpen)를 사용하는 useQuery 훅을 그 다음에 배치합니다.
  const { 
    data: submittedPatents, 
    isLoading: isLoadingSubmitted, 
    isError: isErrorSubmitted, 
    error: errorSubmitted 
  } = useQuery({
    queryKey: ['mySubmittedPatents'],
    queryFn: () => getMyPatents({ 'status_ne': 'DRAFT' }),
    enabled: isModalOpen, // isModalOpen이 여기서 사용되므로, 선언된 이후에 와야 합니다.
  });

  // 3. 상태를 변경하는 핸들러 함수들을 선언합니다.
  const toggleNotifications = () => setIsNotificationOpen(prev => !prev);
  const openPatentListModal = () => setIsModalOpen(true);
  const closePatentListModal = () => setIsModalOpen(false);

  const handleCardClick = (patentId) => {
    navigate(`/patent/${patentId}`);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <TopBar onNotificationClick={toggleNotifications} />
      {isNotificationOpen && <NotificationPanel />}

      {isModalOpen && (
        <PatentListModal 
          onClose={closePatentListModal}
          patents={submittedPatents}
          isLoading={isLoadingSubmitted}
          isError={isErrorSubmitted}
          error={errorSubmitted}
        />
      )}

      <main className="p-8">
        <div className="p-6 mb-8 bg-white rounded-lg shadow-sm">
            <h1 className="text-3xl font-bold text-gray-800">AI와 함께, 출원부터 보완까지 손쉽게</h1>
            <p className="mt-2 text-gray-600">Patentsight AI 어시스턴트가 복잡한 특허 출원 과정을 도와드립니다.</p>
        </div>

        <SearchNavLink />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-3">
            <FeatureGrid onOpenPatentList={openPatentListModal} />
          </div>
        </div>
        
        {/* '나의 출원 목록' 섹션은 이제 모달로 이동했으므로 여기서는 삭제됩니다. */}
      </main>
    </div>
  );
};

export default MyPage;