import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getMyPatents } from '../api/patents';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import PatentCard from '../components/PatentCard';

const PatentCheckListPage = () => {
  const navigate = useNavigate();

  const { data: patents, isLoading, isError, error } = useQuery({
    // 쿼리 키에 필터를 포함하여, 다른 목록과 데이터가 겹치지 않도록 합니다.
    queryKey: ['myPatents', { type: 'PATENT', status: 'DRAFT' }],
    // API 호출 시 필터 객체를 전달합니다.
    queryFn: () => getMyPatents({ type: 'PATENT', status: 'DRAFT' }),
  });

  const handleCardClick = (patentId) => {
    navigate(`/patent/${patentId}`);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <TopBar />
      <main className="p-8">
        <h1 className="text-3xl font-bold text-gray-800">특허·실용신안 점검 (임시저장 목록)</h1>
        <p className="mt-2 text-gray-600">임시저장된 특허 및 실용신안 초안 목록입니다. 카드를 클릭하여 수정을 계속할 수 있습니다.</p>
        <div className="mt-8 space-y-4">
          {isLoading && <p>목록을 불러오는 중입니다...</p>}
          {isError && <p>오류가 발생했습니다: {error.message}</p>}
          {patents && patents.length === 0 && <p>임시저장된 특허·실용신안이 없습니다.</p>}
          {patents && patents.map((p) => (
            <PatentCard key={p.patentId} data={p} onClick={handleCardClick} />
          ))}
        </div>
      </main>
    </div>
  );
};

export default PatentCheckListPage;