import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getLatestDocument, updateDocument, validatePatentDocument } from '../api/patents';

// ADDED: DocumentEditor 테스트를 위한 가짜 문서 데이터
// const mockPatentDocument = {
//   document: {
//     title: '테스트용 스마트 잠금장치',
//     technicalField: '본 발명은 스마트폰과 연동되는 잠금장치에 관한 것이다.',
//     backgroundTechnology: '기존의 기계식 잠금장치는 분실 위험이 크고 원격 제어가 불가능했다.',
//     inventionDetails: {
//       problemToSolve: '원격으로 제어하고 상태를 확인할 수 있는 스마트 잠금장치의 부재.',
//       solution: 'BLE 통신 모듈과 GPS를 탑재하여 스마트폰 앱으로 제어한다.',
//       effect: '도난 방지 및 사용자 편의성 증대.',
//     },
//     summary: 'BLE와 GPS를 이용한 스마트폰 연동형 잠금장치.',
//     drawingDescription: '도 1은 본 발명의 전체 구성도이다.',
//     claims: ['BLE 통신 모듈을 포함하는 스마트 잠금장치.', '상기 잠금장치는 GPS 모듈을 더 포함하는 것을 특징으로 하는 스마트 잠금장치.'],
//   }
// };

// 문서 데이터의 초기 구조 정의
const initialDocumentState = {
  title: '',
  technicalField: '',
  backgroundTechnology: '',
  inventionDetails: {
    problemToSolve: '',
    solution: '',
    effect: '',
  },
  summary: '',
  drawingDescription: '',
  claims: [''],
};

// 테스트용 AI 분석 결과 Mock 데이터 (각 오류에 고유 id와 연관 field 추가)
// const mockAiResults = {
//   formatErrors: [
//     { id: 'err_fe_1', message: "❗ 청구항 번호가 중복되어 있습니다.", field: 'claims' }
//   ],
//   missingSections: [
//     { id: 'err_ms_1', message: "배경기술", field: 'backgroundTechnology' }
//   ],
//   contextualErrors: [
//     { 
//       id: 'err_ce_1', 
//       claim: "청구항 1",
//       claimIndex: 0, // 수정할 청구항의 인덱스 (0부터 시작)
//       analysis: "- 발견된 문제: '고정부'와 '결합부'의 관계가 불명확합니다...",
//       suggestion: "'상기 고정부는 상기 결합부와 일체로 형성되는 것을 특징으로 하는 스마트 잠금장치.'" // AI가 제안하는 수정 텍스트
//     },
//     {
//       id: 'err_ce_2',
//       claim: "청구항 3",
//       claimIndex: 2,
//       analysis: "✅ 논리적 비약이나 문맥상 오류가 발견되지 않았습니다. 잘 작성되었습니다."
//       // 수정 제안이 없으므로 suggestion 필드도 없음
//     }
//   ],
// };

const DocumentEditor = () => {
  const fieldRefs = useRef({});
  const [activeTab, setActiveTab] = useState('details');
  const navigate = useNavigate();
  const { id: patentId } = useParams();
  const [document, setDocument] = useState(initialDocumentState);
  const [aiResults, setAiResults] = useState(null);
  const queryClient = useQueryClient();
  const [drawingFiles, setDrawingFiles] = useState([]); // 도면 파일 목록을 관리할 state
  const location = useLocation(); // location 훅 사용
  // 1. 첨부된 원본 PDF 파일 정보를 저장할 state 추가
  const [attachedPdf, setAttachedPdf] = useState(null);


  const handleDrawingUpload = (event) => {
    const files = Array.from(event.target.files);
    const newFiles = files.map(file => ({
      file,
      preview: URL.createObjectURL(file), // 미리보기를 위한 URL 생성
    }));
    setDrawingFiles(prev => [...prev, ...newFiles]);
  };


  // useQuery가 실제 API를 호출하도록 복원
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['patentDocument', patentId],
    queryFn: () => getLatestDocument(patentId),
    enabled: !!patentId && patentId !== 'new-from-pdf', // PDF로 새로 만들 때는 API 호출 안함
  });

    // ADDED: AI 제안을 적용하는 함수
    const applyAiSuggestion = (claimIndex, suggestionText) => {
        console.log('수정 함수 호출됨!', { claimIndex, suggestionText });
        // 1. 현재 청구항 배열을 복사합니다.
        const newClaims = [...document.claims];
        // 2. 해당 인덱스의 내용을 제안 텍스트로 교체합니다.
        newClaims[claimIndex] = suggestionText;
        // 3. document state를 업데이트하여 화면을 다시 렌더링합니다.
        setDocument(prev => ({ ...prev, claims: newClaims }));
    };


  useEffect(() => {
    console.log("Location State:", location.state);
    const preloadedData = location.state?.parsedData;

    const originalFile = location.state?.originalFile; // 파일 정보 가져오기

    if (originalFile) {
      setAttachedPdf(originalFile);
    }

    if (preloadedData) {
      // PDF로부터 파싱된 데이터가 있으면, 폼 상태를 이 데이터로 설정
      const initialState = { ...initialDocumentState, ...preloadedData };
      setDocument(initialState);
    } else if (data?.document) {
      // 기존처럼 API로부터 받은 데이터로 설정
      const docFromServer = data.document;
      const initialState = {
        ...initialDocumentState, ...docFromServer,
        inventionDetails: { ...initialDocumentState.inventionDetails, ...docFromServer.inventionDetails },
        claims: docFromServer.claims && docFromServer.claims.length > 0 ? docFromServer.claims : [''],
      };
      setDocument(initialState);
    }
  }, [data, location.state]);

  const handleInputChange = (e) => setDocument(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleNestedInputChange = (e) => setDocument(prev => ({ ...prev, inventionDetails: { ...prev.inventionDetails, [e.target.name]: e.target.value } }));
  const handleClaimChange = (index, value) => {
    const newClaims = [...document.claims];
    newClaims[index] = value;
    setDocument(prev => ({ ...prev, claims: newClaims }));
  };
  const addClaim = () => setDocument(prev => ({ ...prev, claims: [...prev.claims, ''] }));
  const removeClaim = (index) => {
    if (document.claims.length <= 1) return;
    setDocument(prev => ({ ...prev, claims: prev.claims.filter((_, i) => i !== index) }));
  };

  const saveMutation = useMutation({
    mutationFn: updateDocument,
    onSuccess: () => {
      alert('성공적으로 임시저장되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['patentDocument', patentId] });
    },
    onError: (err) => alert(`저장 중 오류가 발생했습니다: ${err.message}`),
  });
  const handleSaveDraft = () => saveMutation.mutate({ patentId, documentData: document });

  // aiCheckMutation이 실제 API를 호출하도록 복원
  const aiCheckMutation = useMutation({
    mutationFn: validatePatentDocument,
    onSuccess: (results) => setAiResults(results),
    onError: (err) => alert(`AI 검토 중 오류가 발생했습니다: ${err.message}`),
  });

  const handleAiCheck = () => aiCheckMutation.mutate(document);

  const scrollToField = (fieldName) => {
    const fieldToTabMap = {
      title: 'details', technicalField: 'details', backgroundTechnology: 'details',
      inventionDetails: 'details', summary: 'summary', drawingDescription: 'summary',
      claims: 'claims',
    };
    const targetTab = fieldToTabMap[fieldName];
    if (targetTab) {
      setActiveTab(targetTab);
      setTimeout(() => {
        fieldRefs.current[fieldName]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  };

  if (isLoading) return <div className="flex items-center justify-center h-screen">문서 데이터를 불러오는 중입니다...</div>;
  if (isError) return <div className="flex items-center justify-center h-screen">에러 발생: {error.message}</div>;

  const renderTabs = () => (
    <div className="border-b border-gray-200">
      <nav className="flex -mb-px space-x-8" aria-label="Tabs">
        <button onClick={() => setActiveTab('details')} className={`px-1 py-4 text-sm font-medium border-b-2 ${activeTab === 'details' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>발명의 상세한 설명</button>
        <button onClick={() => setActiveTab('claims')} className={`px-1 py-4 text-sm font-medium border-b-2 ${activeTab === 'claims' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>청구항</button>
        <button onClick={() => setActiveTab('summary')} className={`px-1 py-4 text-sm font-medium border-b-2 ${activeTab === 'summary' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>요약 및 기타</button>
        <button onClick={() => setActiveTab('drawings')} className={`...`}>도면</button>
      </nav>
    </div>
  );

  return (
    <div className="flex w-full h-screen bg-gray-100">
      <div className="flex-grow h-screen overflow-y-auto">
        <header className="sticky top-0 z-10 flex items-center justify-between p-4 bg-white border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-800 truncate">{document.title || "제목 없는 출원서"}</h1>
          <div className="flex items-center gap-2">
            {/* 2. attachedPdf state에 정보가 있을 때만 파일 정보와 다운로드 버튼 표시 */}
            {attachedPdf && (
              <div className="flex items-center p-2 text-sm text-gray-600 bg-gray-100 border rounded-md">
                <span>📄 {attachedPdf.name}</span>
                <button onClick={() => alert('다운로드 기능은 백엔드 연동이 필요합니다.')} className="ml-2 text-blue-500 hover:underline">
                  (다운로드)
                </button>
              </div>
            )}
            <button onClick={handleSaveDraft} disabled={saveMutation.isPending} className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 disabled:bg-gray-200 disabled:cursor-not-allowed">{saveMutation.isPending ? '저장 중...' : '임시저장'}</button>
          
            <button 
          // onClick을 수정하여 navigate 함수의 두 번째 인자로 state를 전달합니다.
          onClick={() => navigate(`/submit/${patentId}`, { state: { documentToSubmit: document } })}
          className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700"
        >
          최종 제출
        </button>
          </div>
        </header>
        <main className="p-8">
          {renderTabs()}
          <div className="mt-6">
            {activeTab === 'details' && (
              <div className="space-y-6">
                <div ref={el => fieldRefs.current['title'] = el} className="p-6 bg-white rounded-md shadow"><label className="block text-lg font-semibold text-gray-700">발명의 명칭</label><input type="text" name="title" value={document.title} onChange={handleInputChange} className="w-full px-3 py-2 mt-2 border border-gray-300 rounded-md"/></div>
                <div ref={el => fieldRefs.current['technicalField'] = el} className="p-6 bg-white rounded-md shadow"><label className="block text-lg font-semibold text-gray-700">기술분야</label><textarea name="technicalField" value={document.technicalField} onChange={handleInputChange} rows="5" className="w-full px-3 py-2 mt-2 border border-gray-300 rounded-md"/></div>
                <div ref={el => fieldRefs.current['backgroundTechnology'] = el} className="p-6 bg-white rounded-md shadow"><label className="block text-lg font-semibold text-gray-700">배경기술</label><textarea name="backgroundTechnology" value={document.backgroundTechnology} onChange={handleInputChange} rows="5" className="w-full px-3 py-2 mt-2 border border-gray-300 rounded-md"/></div>
                <div ref={el => fieldRefs.current['inventionDetails'] = el} className="p-6 bg-white rounded-md shadow"><h3 className="text-lg font-semibold text-gray-700">발명의 상세한 설명</h3><div className="mt-4 space-y-4"><div><label className="block text-md font-medium text-gray-600">해결하려는 과제</label><textarea name="problemToSolve" value={document.inventionDetails.problemToSolve} onChange={handleNestedInputChange} rows="5" className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"/></div><div><label className="block text-md font-medium text-gray-600">과제의 해결 수단</label><textarea name="solution" value={document.inventionDetails.solution} onChange={handleNestedInputChange} rows="5" className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"/></div><div><label className="block text-md font-medium text-gray-600">발명의 효과</label><textarea name="effect" value={document.inventionDetails.effect} onChange={handleNestedInputChange} rows="5" className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"/></div></div></div>
              </div>
            )}
            {activeTab === 'claims' && (
              <div ref={el => fieldRefs.current['claims'] = el} className="p-6 bg-white rounded-md shadow">
                <div className="flex items-center justify-between"><label className="block text-lg font-semibold text-gray-700">청구항</label><button onClick={addClaim} className="px-3 py-1 text-sm font-semibold text-white bg-blue-500 rounded-md hover:bg-blue-600">청구항 추가</button></div>
                {document.claims.map((claim, index) => (<div key={index} className="relative pt-2 mt-2 border-t"><label className="block text-sm font-medium text-gray-600">청구항 {index + 1}</label><textarea value={claim} onChange={(e) => handleClaimChange(index, e.target.value)} rows="4" className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"/>{document.claims.length > 1 && (<button onClick={() => removeClaim(index)} className="absolute top-2 right-0 px-2 py-1 text-xs text-red-500 hover:bg-red-100 rounded-full">삭제</button>)}</div>))}
              </div>
            )}
            {activeTab === 'summary' && (
               <div className="space-y-6">
                  <div ref={el => fieldRefs.current['summary'] = el} className="p-6 bg-white rounded-md shadow"><label className="block text-lg font-semibold text-gray-700">요약</label><textarea name="summary" value={document.summary} onChange={handleInputChange} rows="5" className="w-full px-3 py-2 mt-2 border border-gray-300 rounded-md"/></div>
                  <div ref={el => fieldRefs.current['drawingDescription'] = el} className="p-6 bg-white rounded-md shadow"><label className="block text-lg font-semibold text-gray-700">도면의 간단한 설명</label><textarea name="drawingDescription" value={document.drawingDescription} onChange={handleInputChange} rows="5" className="w-full px-3 py-2 mt-2 border border-gray-300 rounded-md"/></div>
               </div>
            )}
            {activeTab === 'drawings' && (
              <div className="p-6 bg-white rounded-md shadow">
                <label className="block text-lg font-semibold text-gray-700">도면 업로드</label>
                <input type="file" multiple accept="image/png, image/jpeg" onChange={handleDrawingUpload} className="mt-2" />
                <div className="grid grid-cols-3 gap-4 mt-4">
                  {drawingFiles.map((f, index) => (
                    <div key={index} className="border rounded">
                      <img src={f.preview} alt={`도면 미리보기 ${index + 1}`} className="w-full h-auto" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
      <aside className="flex-shrink-0 w-96 h-screen p-6 bg-white border-l border-gray-200 flex flex-col">
        <h2 className="text-lg font-bold">AI 어시스턴트</h2>
        <div className="flex-grow p-4 mt-4 border border-gray-300 rounded-md overflow-y-auto">
          {aiCheckMutation.isPending && <div className="flex items-center justify-center h-full"><p>AI가 문서를 분석 중입니다...</p></div>}
          {!aiCheckMutation.isPending && !aiResults && <div className="text-center text-gray-500"><p>'AI 서류 검토 시작' 버튼을 눌러주세요.</p></div>}
           {aiResults && (
    <div className="space-y-4 text-sm">
      <h3 className="font-bold">[ 형식 오류 ]</h3>
      {aiResults.formatErrors?.length > 0 ? (
        aiResults.formatErrors.map(e => (
          <button key={e.id} onClick={() => scrollToField(e.field)} className="block w-full text-left p-2 rounded hover:bg-gray-100">
            <p className="text-red-600">{e.message}</p>
          </button>
        ))
      ) : <p className="text-green-600">✅ 형식 오류가 발견되지 않았습니다.</p>}

      <h3 className="mt-4 font-bold">[ 필수 항목 누락 ]</h3>
      {aiResults.missingSections?.length > 0 ? (
        aiResults.missingSections.map(s => (
          <button key={s.id} onClick={() => scrollToField(s.field)} className="block w-full text-left p-2 rounded hover:bg-gray-100">
            <p className="text-yellow-600">🟡 누락됨: {s.message}</p>
          </button>
        ))
      ) : <p className="text-green-600">✅ 모든 필수 항목이 포함되었습니다.</p>}

      <h3 className="mt-4 font-bold">[ 문맥 오류 (GPT) ]</h3>
      {aiResults.contextualErrors?.map(c => (
        <div key={c.id} className="p-2 mt-2 bg-gray-50 rounded border">
          <p 
            onClick={() => scrollToField(c.field)} 
            className="font-semibold cursor-pointer hover:text-blue-600"
          >
            {c.claim}
          </p>
          <pre className="mt-1 whitespace-pre-wrap text-gray-700">{c.analysis}</pre>
          
          {/* 수정 제안이 있을 때만 버튼을 보여줍니다. */}
          {c.suggestion && (
            <div className="mt-2 pt-2 border-t">
              <p className="text-xs text-gray-500">AI 수정 제안:</p>
              <p className="text-xs text-blue-700 italic">"{c.suggestion}"</p>
              <button 
                onClick={() => applyAiSuggestion(c.claimIndex, c.suggestion)}
                className="w-full px-2 py-1 mt-2 text-xs font-semibold text-white bg-green-600 rounded hover:bg-green-700"
              >
                ✨ 이대로 수정
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  )}
        </div>
        <div className="mt-4 space-y-2">
            <button onClick={() => alert('3D 변환 기능 구현 예정')} className="w-full px-4 py-2 font-semibold text-white bg-indigo-500 rounded-md hover:bg-indigo-600">도면 3D 변환</button>
            <button onClick={handleAiCheck} disabled={aiCheckMutation.isPending} className="w-full px-4 py-2 font-semibold text-white bg-green-500 rounded-md hover:bg-green-600 disabled:bg-gray-400">{aiCheckMutation.isPending ? '분석 중...' : 'AI 서류 검토 시작'}</button>
        </div>
      </aside>
    </div>
  );
};

export default DocumentEditor;