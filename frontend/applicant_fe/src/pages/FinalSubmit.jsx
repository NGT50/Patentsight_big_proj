import React from 'react';
// useLocation을 import 합니다. useQuery는 더 이상 필요 없습니다.
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
// getLatestDocument는 더 이상 필요 없습니다.
import { submitPatent } from '../api/patents';

const FinalSubmitPage = () => {
  const { id: patentId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const location = useLocation(); // location 훅을 사용합니다.

  // 이전 페이지에서 전달받은 document state를 가져옵니다.
  const document = location.state?.documentToSubmit;

  const submissionMutation = useMutation({
    mutationFn: submitPatent,
    onSuccess: (result) => {
      alert(`최종 제출이 완료되었습니다. (출원번호: ${result.applicationNumber})`);
      
      // 이 한 줄만 있으면 됩니다. 마이페이지 데이터를 새로고침하라는 명령.
      queryClient.invalidateQueries(['myPatents']);
      
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

  // document 데이터가 없는 경우 (예: URL로 직접 접근)에 대한 예외 처리
  if (!document) {
    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <p>제출할 문서 정보가 없습니다.</p>
            <button onClick={() => navigate('/mypage')} className="mt-4 px-4 py-2 text-white bg-blue-600 rounded">
                마이페이지로 돌아가기
            </button>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800">출원 최종 등록</h1>
        <p className="mt-2 text-gray-600">제출 전, 마지막으로 서류 내용을 확인해주세요. 제출 후에는 내용을 수정할 수 없습니다.</p>
        
        <div className="mt-8 p-8 bg-white border border-gray-200 rounded-lg shadow-sm space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-500">발명의 명칭</h3>
            <p className="text-xl font-bold text-gray-800">{document?.title}</p>
          </div>
          <div className="border-t my-4"></div>
          <div>
            <h3 className="text-sm font-semibold text-gray-500">요약</h3>
            <p className="text-gray-700">{document?.summary}</p>
          </div>
          <div className="border-t my-4"></div>
          <div>
            <h3 className="text-sm font-semibold text-gray-500">대표 청구항</h3>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              {document?.claims?.map((claim, index) => <li key={index}>{claim}</li>)}
            </ul>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button onClick={() => navigate(`/patent/${patentId}/edit`)} className="px-6 py-2 mr-4 font-semibold text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
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