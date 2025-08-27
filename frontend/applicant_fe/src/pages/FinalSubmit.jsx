import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import ThreeDModelViewer from '../components/ThreeDModelViewer';

const FinalSubmitPage = () => {
  const { id: patentId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const location = useLocation();

  const document = location.state?.documentToSubmit;
  const drawings = location.state?.drawingsToSubmit;
  const model = location.state?.modelToSubmit;

  const submissionMutation = useMutation({
    mutationFn: async (patentId) => {
      console.log(`Submitting for patentId: ${patentId}`);
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({ applicationNumber: '10-2025-0123456' });
        }, 2000);
      });
    },
    onSuccess: (result) => {
      alert(`최종 제출이 완료되었습니다. (출원번호: ${result.applicationNumber})`);
      queryClient.invalidateQueries({ queryKey: ['myPatents'] });
      queryClient.invalidateQueries({ queryKey: ['patentDetail', patentId] });
      navigate(`/patent/${patentId}`);
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

  if (!document) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p>제출할 문서 정보가 없습니다. 편집 페이지에서 다시 시도해주세요.</p>
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
            <h3 className="text-sm font-semibold text-gray-500">기술분야</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{document?.technicalField}</p>
          </div>
          <div className="border-t my-4"></div>
          <div>
            <h3 className="text-sm font-semibold text-gray-500">배경기술</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{document?.backgroundTechnology}</p>
          </div>
          <div className="border-t my-4"></div>
          <div>
            <h3 className="text-sm font-semibold text-gray-500 mb-2">발명의 상세한 설명</h3>
            <div className="space-y-4 pl-4 border-l-2">
              <div>
                <h4 className="font-semibold text-gray-600">해결하려는 과제</h4>
                <p className="text-gray-700 whitespace-pre-wrap">{document?.inventionDetails?.problemToSolve}</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-600">과제의 해결 수단</h4>
                <p className="text-gray-700 whitespace-pre-wrap">{document?.inventionDetails?.solution}</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-600">발명의 효과</h4>
                <p className="text-gray-700 whitespace-pre-wrap">{document?.inventionDetails?.effect}</p>
              </div>
            </div>
          </div>
          <div className="border-t my-4"></div>
          <div>
            <h3 className="text-sm font-semibold text-gray-500">요약</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{document?.summary}</p>
          </div>
          <div className="border-t my-4"></div>
          <div>
            <h3 className="text-sm font-semibold text-gray-500">청구범위</h3>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              {document?.claims?.map((claim, index) => <li key={index} className="whitespace-pre-wrap">{claim}</li>)}
            </ul>
          </div>

          {(drawings && drawings.length > 0) && (
            <>
              <div className="border-t my-4"></div>
              <div>
                <h3 className="text-sm font-semibold text-gray-500">대표 도면</h3>
                <div className="mt-2 flex justify-center p-4 border rounded-md">
                  <img 
                    src={drawings[0].fileUrl} 
                    alt="대표 도면" 
                    className="max-w-full h-auto max-h-80 object-contain"
                  />
                </div>
              </div>
            </>
          )}

          {model && (
            <>
              <div className="border-t my-4"></div>
              <div>
                <h3 className="text-sm font-semibold text-gray-500">3D 모델</h3>
                <div className="mt-2">
                  <ThreeDModelViewer src={model.fileUrl} />
                </div>
              </div>
            </>
          )}
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