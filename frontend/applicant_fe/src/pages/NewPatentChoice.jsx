import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createPatent } from '../api/patents';
import { parsePatentPdf } from '../api/files';
import { initialDocumentState } from '../utils/documentState'; 

const NewPatentChoicePage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();
  const [selectedType, setSelectedType] = useState(null);

  const createPatentMutation = useMutation({
    mutationFn: createPatent,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['myPatents'] });
      // [FIXED] 경로 맨 앞에 '/'를 추가하여 올바른 절대 경로로 수정합니다.
      navigate(`/patent/${data.patentId}`);
    },
    onError: (err) => alert(`출원서 생성에 실패했습니다: ${err.message}`),
  });

  // 'PDF 초안으로 시작'을 위한 수정된 흐름
  const parsePdfMutation = useMutation({
    mutationFn: parsePatentPdf,
    onSuccess: (parsedData) => {
      // 파싱된 데이터로 바로 '새 특허 생성' API를 호출합니다.
      createPatentMutation.mutate({
        ...parsedData,
        type: selectedType,
      });
    },
    onError: (err) => alert(`PDF 분석에 실패했습니다: ${err.message}`),
  });

  const handleCreateNew = () => {
    if (createPatentMutation.isPending || !selectedType) return;
    createPatentMutation.mutate({ 
      ...initialDocumentState, 
      title: '제목 없는 출원서', 
      type: selectedType 
    });
  };

  const handlePdfBoxClick = () => {
    if (parsePdfMutation.isPending || createPatentMutation.isPending || !selectedType) return;
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      parsePdfMutation.mutate(file);
    }
    event.target.value = null; 
  };
  
  const isLoading = createPatentMutation.isPending || parsePdfMutation.isPending;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="max-w-3xl w-full p-8 text-center">
        {!selectedType ? (
          <>
            <h1 className="text-3xl font-bold text-gray-800">어떤 종류의 출원을 등록하시겠습니까?</h1>
            <p className="mt-4 text-gray-600">등록할 출원의 종류를 먼저 선택해주세요.</p>
            <div className="flex justify-center gap-8 mt-10">
              <div onClick={() => setSelectedType('PATENT')} className="p-8 bg-white border-2 border-transparent rounded-lg shadow-lg cursor-pointer w-80 hover:border-blue-500 transition-all">
                <h2 className="text-xl font-bold">특허 / 실용신안</h2>
                <p className="mt-2 text-sm text-gray-500">기술적 사상이나 아이디어에 대한 권리를 보호받습니다.</p>
              </div>
              <div onClick={() => setSelectedType('DESIGN')} className="p-8 bg-white border-2 border-transparent rounded-lg shadow-lg cursor-pointer w-80 hover:border-blue-500 transition-all">
                <h2 className="text-xl font-bold">디자인 / 상표</h2>
                <p className="mt-2 text-sm text-gray-500">제품의 독창적인 디자인이나 브랜드를 보호받습니다.</p>
              </div>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-bold text-gray-800">새로운 출원서 등록</h1>
            <p className="mt-4 text-gray-600">어떤 방식으로 출원을 시작하시겠습니까?</p>
            <div className="flex justify-center gap-8 mt-10">
              <div onClick={handleCreateNew} className="p-8 bg-white border-2 border-transparent rounded-lg shadow-lg cursor-pointer w-72 hover:border-blue-500 transition-all">
                <h2 className="text-xl font-bold">
                  {isLoading && !parsePdfMutation.isPending ? '생성 중...' : '새 양식으로 직접 작성'}
                </h2>
                <p className="mt-2 text-sm text-gray-500">빈 서식에 직접 내용을 입력하여 새로운 출원서를 작성합니다.</p>
              </div>
              <div onClick={handlePdfBoxClick} className="p-8 bg-white border-2 border-transparent rounded-lg shadow-lg cursor-pointer w-72 hover:border-blue-500 transition-all">
                <h2 className="text-xl font-bold">
                  {isLoading ? '처리 중...' : 'PDF 초안으로 시작'}
                </h2>
                <p className="mt-2 text-sm text-gray-500">가지고 계신 PDF 초안을 업로드하여 자동으로 내용을 채웁니다.</p>
              </div>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".pdf" />
            </div>
            <button onClick={() => setSelectedType(null)} className="mt-8 text-sm text-gray-500 hover:underline">← 뒤로가기</button>
          </>
        )}
      </div>
    </div>
  );
};

export default NewPatentChoicePage;