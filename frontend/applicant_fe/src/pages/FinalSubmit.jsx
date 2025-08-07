import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getLatestDocument, submitPatent } from '../api/patents';

const FinalSubmitPage = () => {
  const { id: patentId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // 1. 최종 검토를 위해 최신 문서 데이터를 불러옵니다.
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['patentDocument', patentId],
    queryFn: () => getLatestDocument(patentId),
    enabled: !!patentId,
  });

  // 2. '최종 제출'을 위한 useMutation 훅을 설정합니다.
  const submissionMutation = useMutation({
    mutationFn: submitPatent,
    onSuccess: (result) => {
      alert(`최종 제출이 완료되었습니다. (출원번호: ${result.applicationNumber})`);
      // 마이페이지의 출원 목록 캐시를 무효화하여 최신 상태로 업데이트하도록 유도
      queryClient.invalidateQueries({ queryKey: ['myPatents'] });
      navigate('/mypage');
    },
    onError: (err) => {
      alert(`최종 제출 중 오류가 발생했습니다: ${err.message}`);
    },
  });

  const handleFinalSubmit = () => {
    if (window.confirm('정말로 서류를 최종 제출하시겠습니까? 제출 후에는 수정할 수 없습니다.')) {
      submissionMutation.mutate(patentId);
    }
  };

  if (isLoading) return <div className="flex items-center justify-center h-screen">제출할 문서를 불러오는 중입니다...</div>;
  if (isError) return <div className="flex items-center justify-center h-screen">에러 발생: {error.message}</div>;

  const document = data?.document;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800">출원 최종 등록</h1>
        <p className="mt-2 text-gray-600">제출 전, 마지막으로 서류 내용을 확인해주세요. 제출 후에는 내용을 수정할 수 없습니다.</p>
        
        {/* 3. 문서를 읽기 전용으로 표시합니다. */}
        <div className="mt-8 p-6 bg-white border border-gray-200 rounded-lg shadow-sm space-y-4">
          <h2 className="text-xl font-bold">{document?.title}</h2>
          <div className="text-sm text-gray-700 whitespace-pre-wrap">
            <h3 className="font-semibold mt-4">요약</h3>
            <p>{document?.summary}</p>
            <h3 className="font-semibold mt-4">청구항 1</h3>
            <p>{document?.claims?.[0]}</p>
            {/* ... 필요에 따라 더 많은 필드를 여기에 표시 ... */}
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button onClick={() => navigate(`/patent/${patentId}`)} className="px-6 py-2 mr-4 font-semibold text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
            수정하러 가기
          </button>
          <button 
            onClick={handleFinalSubmit} 
            disabled={submissionMutation.isPending}
            className="px-6 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            {submissionMutation.isPending ? '제출 중...' : '최종 제출 확정'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FinalSubmitPage;