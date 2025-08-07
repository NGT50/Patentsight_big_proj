import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createPatent } from '../api/patents';
import { parsePatentPdf } from '../api/files';

const NewPatentChoicePage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();

  // 2. 새 특허 생성 API 호출이 성공하면, 받은 patentId로 에디터 페이지로 이동합니다.
  const createPatentMutation = useMutation({
    mutationFn: createPatent,
    onSuccess: (data) => {
      // 새 특허가 생성되었으므로, 마이페이지 목록 캐시를 무효화합니다.
      queryClient.invalidateQueries({ queryKey: ['myPatents'] });
      // 새로 받은 ID로 에디터 페이지 이동
      navigate(`/patent/${data.patentId}`);
    },
    onError: (err) => alert(`출원서 생성에 실패했습니다: ${err.message}`),
  });

  // 1. PDF 파싱이 성공하면, 그 결과(parsedData)로 createPatentMutation을 호출합니다.
  const parsePdfMutation = useMutation({
    mutationFn: parsePatentPdf,
    onSuccess: (parsedData) => {
      // 파싱된 데이터로 '새 특허 생성'을 요청합니다.
      createPatentMutation.mutate(parsedData);
    },
    onError: (err) => alert(`PDF 분석에 실패했습니다: ${err.message}`),
  });

  const handleCreateNew = () => {
    if (createPatentMutation.isPending) return;
    createPatentMutation.mutate({ title: '제목 없는 출원서', type: 'PATENT' });
  };

  const handlePdfBoxClick = () => {
    if (parsePdfMutation.isPending || createPatentMutation.isPending) return;
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      parsePdfMutation.mutate(file);
    }
    // 동일한 파일을 다시 업로드할 수 있도록 value를 초기화합니다.
    event.target.value = null; 
  };

  const isLoading = createPatentMutation.isPending || parsePdfMutation.isPending;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="max-w-2xl w-full p-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800">새로운 출원서 등록</h1>
        <p className="mt-4 text-gray-600">어떤 방식으로 출원을 시작하시겠습니까?</p>
        <div className="flex justify-center gap-8 mt-10">
          <div onClick={handleCreateNew} className="p-8 bg-white border-2 border-transparent rounded-lg shadow-lg cursor-pointer w-72 hover:border-blue-500 transition-all">
            <h2 className="text-xl font-bold">
              {createPatentMutation.isPending && !parsePdfMutation.isPending ? '생성 중...' : '새 양식으로 직접 작성'}
            </h2>
            <p className="mt-2 text-sm text-gray-500">빈 서식에 직접 내용을 입력하여 새로운 출원서를 작성합니다.</p>
          </div>
          <div onClick={handlePdfBoxClick} className="p-8 bg-white border-2 border-transparent rounded-lg shadow-lg cursor-pointer w-72 hover:border-blue-500 transition-all">
            <h2 className="text-xl font-bold">
              {isLoading ? '처리 중...' : 'PDF 초안으로 시작'}
            </h2>
            <p className="mt-2 text-sm text-gray-500">가지고 계신 PDF 초안을 업로드하여 자동으로 내용을 채웁니다.</p>
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept=".pdf"
          />
        </div>
      </div>
    </div>
  );
};

export default NewPatentChoicePage;