import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getMyPatents } from '../api/patents';
import { FileText, AlertCircle } from 'lucide-react';

// '임시저장 목록' 카드 UI를 위한 별도 컴포넌트 (가독성을 위해 분리)
const DraftPatentCard = ({ patent, onClick }) => (
  <div
    onClick={onClick}
    className="bg-white p-4 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer flex gap-4"
  >
    <div className="w-24 h-24 bg-gray-100 rounded-md flex items-center justify-center text-gray-400">
      {/* TODO: 실제 도면 이미지가 있다면 patent.image 등으로 교체 */}
      <FileText size={32} />
    </div>
    <div className="flex-1">
      <h3 className="text-lg font-bold text-gray-800">{patent.title}</h3>
      <div className="text-xs text-gray-500 mt-1 space-y-1">
        <p>
          <span>IPC: {patent.ipc || 'N/A'}</span> | <span>CPC: {patent.cpc || 'N/A'}</span>
        </p>
        <p>
          <span>출원번호: {patent.applicationNumber || 'N/A'}</span> | <span>출원일: {patent.applicationDate || 'N/A'}</span>
        </p>
        <p>
          <span>출원인: {patent.inventor || patent.applicantName || '미지정'}</span> | <span>상태: <span className="font-semibold text-yellow-600 bg-yellow-100 px-1.5 py-0.5 rounded">{patent.status}</span></span>
        </p>
      </div>
      <p className="text-sm text-gray-700 mt-2 line-clamp-2">
        📌 {patent.summary || '요약 정보가 없습니다.'}
      </p>
    </div>
  </div>
);


const DraftsListPage = () => {
  const navigate = useNavigate();

  // 1. MyPage와 동일한 queryKey를 사용하여 캐시 데이터를 공유하고 자동 업데이트 받음
  const { data: allMyPatents, isLoading, isError, error } = useQuery({
    queryKey: ['myPatents'],
    queryFn: getMyPatents,
  });

  // 2. [핵심] 받아온 전체 데이터에서 status가 'DRAFT'인 특허/실용신안만 필터링
  const draftPatents = allMyPatents?.filter(p => 
    p.status === 'DRAFT' && (p.type === 'PATENT' || p.type === 'UTILITY_MODEL')
  ) || [];

  const handleCardClick = (patentId) => {
    // 임시저장된 문서는 편집기 페이지로 이동
    navigate(`/patent/${patentId}`);
  };

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">특허·실용신안 점검 (임시저장 목록)</h1>
        <p className="mt-2 text-gray-600">임시저장된 특허 및 실용신안 초안 목록입니다. 카드를 클릭하여 수정을 계속할 수 있습니다.</p>
      </div>

      {isLoading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-3 text-gray-600">임시저장 목록을 불러오는 중입니다...</p>
        </div>
      )}

      {isError && (
        <div className="text-center py-12 bg-red-50 p-6 rounded-lg">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <p className="text-red-700 font-semibold">오류가 발생했습니다: {error?.message}</p>
        </div>
      )}

      {!isLoading && !isError && (
        <div className="space-y-6">
          {draftPatents.length > 0 ? (
            draftPatents.map(patent => (
              <DraftPatentCard 
                key={patent.patentId}
                patent={patent}
                onClick={() => handleCardClick(patent.patentId)}
              />
            ))
          ) : (
            <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">임시저장된 특허 초안이 없습니다.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DraftsListPage;
