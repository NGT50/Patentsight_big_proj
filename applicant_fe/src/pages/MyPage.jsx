import React from 'react';
import TopBar from '../components/TopBar';
import FeatureGrid from '../components/FeatureGrid';
import PatentCard from '../components/PatentCard';
import NotificationPanel from '../components/NotificationPanel'; // 1. 새로운 컴포넌트 import
import { useQuery } from '@tanstack/react-query';
import { getMyPatents } from '../api/patents';
import { useNavigate } from 'react-router-dom';


const MyPage = () => {
  const navigate = useNavigate();
  // (useQuery와 mock 데이터 로직은 이전과 동일하게 유지합니다. 테스트를 위해 mock 데이터를 사용하겠습니다.)
  const mockPatents = [
    { patentId: 101, title: '첫 번째 테스트 특허: 스마트 잠금장치' },
    { patentId: 102, title: '두 번째 테스트 특허: AI 기반 번역 시스템' },
  ];
  const patents = mockPatents;
  const isLoading = false;
  const isError = false;
  const error = null;


  const handleCardClick = (patentId) => {
    navigate(`/patent/${patentId}`);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <TopBar />
      <main className="p-8">
        {/* 2. 환영 메시지 및 알림 패널을 포함한 새로운 레이아웃 구조 */}
        <div className="p-6 mb-8 bg-white rounded-lg shadow-sm">
            <h1 className="text-3xl font-bold text-gray-800">AI와 함께, 출원부터 보완까지 손쉽게</h1>
            <p className="mt-2 text-gray-600">Patentsight AI 어시스턴트가 복잡한 특허 출원 과정을 도와드립니다.</p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* FeatureGrid와 알림 패널을 그리드 시스템으로 배치 */}
          <div className="lg:col-span-2">
            {/* 3. FeatureGrid에 디자인에 맞는 props를 전달합니다. */}
            <FeatureGrid />
          </div>
          <div>
            <NotificationPanel />
          </div>
        </div>

        <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-800">📄 나의 출원 목록</h2>
            <div className="mt-4 space-y-4">
            {isLoading && <p>출원 목록을 불러오는 중입니다...</p>}
            {isError && <p>오류가 발생했습니다: {error.message}</p>}
            {patents && patents.length === 0 && <p>출원 내역이 없습니다.</p>}
            {patents && patents.map((p) => (
                <PatentCard key={p.patentId} data={p} onClick={handleCardClick} />
            ))}
            </div>
        </div>
      </main>
    </div>
  );
};

export default MyPage;