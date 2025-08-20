import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getLatestDocument, updateDocument, validatePatentDocument } from '../api/patents';
import { uploadFile } from '../api/files';
import { 
  FileText, Save, Download, Send, Bot, Box, CheckCircle, AlertCircle, X,
  Plus, Trash2, Eye, Edit3, AlertTriangle
} from 'lucide-react';

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

const DocumentEditor = () => {
  // --- State 및 Hooks 선언 (jw-front 기능) ---
  const fieldRefs = useRef({});
  const [activeTab, setActiveTab] = useState('details');
  const navigate = useNavigate();
  const { id: patentId } = useParams();
  const [document, setDocument] = useState(initialDocumentState);
  const [aiResults, setAiResults] = useState(null);
  const queryClient = useQueryClient();
  const location = useLocation();
  const [drawingFiles, setDrawingFiles] = useState([]);
  const [attachedPdf, setAttachedPdf] = useState(null);

  // --- 데이터 로딩 및 상태 초기화 (jw-front 기능) ---
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['patentDocument', patentId],
    queryFn: () => getLatestDocument(patentId),
    enabled: !!patentId && patentId !== 'new-from-pdf',
  });

  useEffect(() => {
    const preloadedData = location.state?.parsedData;
    const originalFile = location.state?.originalFile;

    if (originalFile) {
      setAttachedPdf(originalFile);
    }

    if (preloadedData) {
      const initialState = { ...initialDocumentState, ...preloadedData };
      setDocument(initialState);
    } else if (data?.document) {
      const docFromServer = data.document;
      const initialState = {
        ...initialDocumentState, ...docFromServer,
        inventionDetails: { ...initialDocumentState.inventionDetails, ...docFromServer.inventionDetails },
        claims: docFromServer.claims && docFromServer.claims.length > 0 ? docFromServer.claims : [''],
      };
      setDocument(initialState);
      if (docFromServer.originalFile) {
        setAttachedPdf(docFromServer.originalFile);
      }
    }
  }, [data, location.state]);

  // --- 핸들러 및 Mutation 함수 (jw-front 기능) ---
  const handleInputChange = (e) => setDocument(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleNestedInputChange = (e) => setDocument(prev => ({ ...prev, inventionDetails: { ...prev.inventionDetails, [e.target.name]: e.target.value } }));
  
  const handleClaimChange = (index, value) => {
    const newClaims = [...document.claims];
    newClaims[index] = value;
    setDocument(prev => ({ ...prev, claims: newClaims }));
  };
  const addClaim = () => setDocument(prev => ({ ...prev, claims: [...prev.claims, ''] }));
  const removeClaim = (index) => {
    if (document.claims.length > 1) {
      const newClaims = document.claims.filter((_, i) => i !== index);
      setDocument(prev => ({ ...prev, claims: newClaims }));
    }
  };
  const handleDrawingUpload = async (event) => {
    const files = Array.from(event.target.files);
    const previews = [];
    for (const file of files) {
      try {
        await uploadFile({ file, patentId });
        previews.push({ file, preview: URL.createObjectURL(file) });
      } catch (err) {
        console.error('도면 업로드 실패:', err);
        alert('도면 업로드에 실패했습니다.');
      }
    }
    if (previews.length > 0) {
      setDrawingFiles(prev => [...prev, ...previews]);
    }
  };

  const saveMutation = useMutation({
    mutationFn: updateDocument,
    onSuccess: (data, variables) => { // onSuccess 콜백에 data와 variables 추가
      queryClient.invalidateQueries({ queryKey: ['patentDocument', patentId] });
      // finalSubmit 콜백이 있을 경우에만 실행
      if (variables.onSuccessCallback) {
        variables.onSuccessCallback();
      } else {
        alert('임시저장이 완료되었습니다.');
      }
    },
    onError: (error) => {
      alert('저장 중 오류가 발생했습니다: ' + error.message);
    },
  });

  const aiCheckMutation = useMutation({
    mutationFn: validatePatentDocument,
    onSuccess: (data) => {
      setAiResults(data);
      alert('AI 분석이 완료되었습니다.');
    },
    onError: (error) => {
      alert('AI 분석 중 오류가 발생했습니다: ' + error.message);
    },
  });

  const handleSaveDraft = () => saveMutation.mutate({ patentId, documentData: document });
  
  // ✅✅✅ START: 이 부분이 수정/추가되었습니다 ✅✅✅
  const handleFinalSubmit = () => {
    // 1. 먼저 현재 문서를 저장(updateDocument)합니다.
    saveMutation.mutate(
      { 
        patentId, 
        documentData: document,
        // 2. 저장이 성공하면, 다음 페이지로 이동하는 콜백 함수를 넘겨줍니다.
        onSuccessCallback: () => {
          alert('최종 제출을 위해 다음 페이지로 이동합니다.');
          navigate(`/submit/${patentId}`, { state: { documentToSubmit: document } });
        }
      },
    );
  };
  // ✅✅✅ END: 수정/추가 완료 ✅✅✅
  
  const handleAiCheck = () => aiCheckMutation.mutate(document);
  
  const applyAiSuggestion = (claimIndex, suggestionText) => {
    const newClaims = [...document.claims];
    newClaims[claimIndex] = suggestionText;
    setDocument(prev => ({ ...prev, claims: newClaims }));
  };

  const scrollToField = (fieldName) => {
    const fieldToTabMap = {
      title: 'details', technicalField: 'details', backgroundTechnology: 'details',
      inventionDetails: 'details', summary: 'summary', drawingDescription: 'summary',
      claims: 'claims', drawings: 'drawings',
    };
    const targetTab = fieldToTabMap[fieldName];
    if (targetTab) {
      setActiveTab(targetTab);
      setTimeout(() => {
        fieldRefs.current[fieldName]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  };

  // --- 로딩 및 에러 UI (develop-fe2 디자인) ---
  if (isLoading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">문서 데이터를 불러오는 중입니다...</p>
      </div>
    </div>
  );
  
  if (isError) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600">에러 발생: {error.message}</p>
      </div>
    </div>
  );

  // --- 렌더링 JSX (develop-fe2 디자인 기반 + jw-front 기능) ---
  const renderTabs = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <nav className="flex space-x-8" aria-label="Tabs">
        <button 
          onClick={() => setActiveTab('details')} 
          className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all ${
            activeTab === 'details' 
              ? 'bg-blue-100 text-blue-700 border border-blue-200 hover:bg-blue-200' 
              : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          발명의 상세한 설명
        </button>
        <button 
          onClick={() => setActiveTab('claims')} 
          className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all ${
            activeTab === 'claims' 
              ? 'bg-blue-100 text-blue-700 border border-blue-200 hover:bg-blue-200' 
              : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
          }`}
        >
          <Edit3 className="w-4 h-4" />
          청구범위
        </button>
        <button 
          onClick={() => setActiveTab('summary')} 
          className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all ${
            activeTab === 'summary' 
              ? 'bg-blue-100 text-blue-700 border border-blue-200 hover:bg-blue-200' 
              : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
          }`}
        >
          <Eye className="w-4 h-4" />
          요약 및 기타
        </button>
        <button 
          onClick={() => setActiveTab('drawings')} 
          className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all ${
            activeTab === 'drawings' 
              ? 'bg-blue-100 text-blue-700 border border-blue-200 hover:bg-blue-200' 
              : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
          }`}
        >
          도면
        </button>
      </nav>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-screen-xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{document.title || "제목 없는 출원서"}</h1>
              <p className="text-gray-600 mt-1">출원서 편집기</p>
            </div>
            <div className="flex items-center gap-3">
              {attachedPdf && (<div className="flex items-center p-2 text-sm text-gray-600 bg-gray-100 border rounded-md"><span>📄 {attachedPdf.name}</span><button onClick={() => alert('다운로드 기능 구현 예정')} className="ml-2 font-semibold text-blue-600 hover:underline">(다운로드)</button></div>)}
              <button onClick={handleSaveDraft} disabled={saveMutation.isPending} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 disabled:bg-gray-200 transition-all"><Save className="w-4 h-4" /> {saveMutation.isPending ? '저장 중...' : '임시저장'}</button>
              <button onClick={handleFinalSubmit} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 transition-all"><Send className="w-4 h-4" /> 최종 제출</button>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {renderTabs()}
            <div className="space-y-6">
              {activeTab === 'details' && (
                <div className="space-y-6">
                  <div ref={el => fieldRefs.current['title'] = el} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"><label className="block text-lg font-semibold text-gray-800 mb-3">발명의 명칭</label><input type="text" name="title" value={document.title} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" placeholder="발명의 명칭을 입력하세요"/></div>
                  <div ref={el => fieldRefs.current['technicalField'] = el} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"><label className="block text-lg font-semibold text-gray-800 mb-3">기술분야</label><textarea name="technicalField" value={document.technicalField} onChange={handleInputChange} rows="5" className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none" placeholder="발명이 속하는 기술분야를 설명하세요"/></div>
                  <div ref={el => fieldRefs.current['backgroundTechnology'] = el} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"><label className="block text-lg font-semibold text-gray-800 mb-3">배경기술</label><textarea name="backgroundTechnology" value={document.backgroundTechnology} onChange={handleInputChange} rows="5" className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none" placeholder="관련된 배경기술을 설명하세요"/></div>
                  <div ref={el => fieldRefs.current['inventionDetails'] = el} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"><h3 className="text-lg font-semibold text-gray-800 mb-4">발명의 상세한 설명</h3><div className="space-y-6"><div><label className="block text-md font-medium text-gray-700 mb-2">해결하려는 과제</label><textarea name="problemToSolve" value={document.inventionDetails.problemToSolve} onChange={handleNestedInputChange} rows="4" className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none" placeholder="해결하려는 기술적 과제를 설명하세요"/></div><div><label className="block text-md font-medium text-gray-700 mb-2">과제의 해결 수단</label><textarea name="solution" value={document.inventionDetails.solution} onChange={handleNestedInputChange} rows="4" className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none" placeholder="과제를 해결하는 수단을 설명하세요"/></div><div><label className="block text-md font-medium text-gray-700 mb-2">발명의 효과</label><textarea name="effect" value={document.inventionDetails.effect} onChange={handleNestedInputChange} rows="4" className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none" placeholder="발명의 효과를 설명하세요"/></div></div></div>
                </div>
              )}
              {activeTab === 'claims' && (
                <div ref={el => fieldRefs.current['claims'] = el} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6"><label className="block text-lg font-semibold text-gray-800">청구범위</label><button onClick={addClaim} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all"><Plus className="w-4 h-4" /> 청구항 추가</button></div>
                  <div className="space-y-6">{document.claims.map((claim, index) => (<div key={index} className="relative p-4 border border-gray-200 rounded-lg bg-gray-50"><div className="flex items-center justify-between mb-3"><label className="block text-sm font-medium text-gray-700">청구항 {index + 1}</label>{document.claims.length > 1 && (<button onClick={() => removeClaim(index)} className="flex items-center gap-1 px-2 py-1 text-xs text-red-600 hover:bg-red-100 rounded-md transition-all"><Trash2 className="w-3 h-3" /> 삭제</button>)}</div><textarea value={claim} onChange={(e) => handleClaimChange(index, e.target.value)} rows="4" className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none bg-white" placeholder={`청구항 ${index + 1}의 내용을 입력하세요`}/></div>))}</div>
                </div>
              )}
              {activeTab === 'summary' && (
                <div className="space-y-6">
                  <div ref={el => fieldRefs.current['summary'] = el} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"><label className="block text-lg font-semibold text-gray-800 mb-3">요약</label><textarea name="summary" value={document.summary} onChange={handleInputChange} rows="5" className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none" placeholder="발명의 요약을 입력하세요"/></div>
                  <div ref={el => fieldRefs.current['drawingDescription'] = el} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"><label className="block text-lg font-semibold text-gray-800 mb-3">도면의 간단한 설명</label><textarea name="drawingDescription" value={document.drawingDescription} onChange={handleInputChange} rows="5" className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none" placeholder="도면에 대한 간단한 설명을 입력하세요"/></div>
                </div>
              )}
              {activeTab === 'drawings' && (
                <div ref={el => fieldRefs.current['drawings'] = el} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <label className="block text-lg font-semibold text-gray-800 mb-3">도면 업로드</label>
                  <input type="file" multiple accept="image/png, image/jpeg" onChange={handleDrawingUpload} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                  <div className="grid grid-cols-3 gap-4 mt-4">{drawingFiles.map((f, index) => (<div key={index} className="border rounded-lg overflow-hidden"><img src={f.preview} alt={`도면 미리보기 ${index + 1}`} className="w-full h-auto object-cover" /></div>))}</div>
                </div>
              )}
            </div>
          </div>
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-8">
              <div className="flex items-center gap-2 mb-4"><Bot className="w-5 h-5 text-blue-600" /><h2 className="text-lg font-bold text-gray-800">AI 어시스턴트</h2></div>
              <div className="bg-gray-50 rounded-lg p-4 mb-6 min-h-[400px] max-h-[500px] overflow-y-auto">
                {aiCheckMutation.isPending && (<div className="flex items-center justify-center h-full"><div className="text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div><p className="text-gray-600">AI가 문서를 분석 중입니다...</p></div></div>)}
                {!aiCheckMutation.isPending && !aiResults && (<div className="text-center text-gray-500 flex flex-col justify-center h-full"><Bot className="w-12 h-12 mx-auto mb-2 text-gray-400" /><p>'AI 서류 검토 시작' 버튼을 눌러주세요.</p></div>)}
                {aiResults && (<div className="space-y-4 text-sm"><div className="bg-red-50 border border-red-200 rounded-lg p-3"><h3 className="font-bold text-red-800 flex items-center gap-2 mb-2"><AlertCircle className="w-4 h-4" /> 형식 오류</h3>{aiResults.formatErrors?.length > 0 ? (<div className="space-y-2">{aiResults.formatErrors.map(e => (<button key={e.id} onClick={() => scrollToField(e.field)} className="block w-full text-left p-2 rounded hover:bg-red-100 transition-all"><p className="text-red-700">{e.message}</p></button>))}</div>) : (<p className="text-green-700 flex items-center gap-1"><CheckCircle className="w-4 h-4" /> 형식 오류가 발견되지 않았습니다.</p>)}</div><div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3"><h3 className="font-bold text-yellow-800 flex items-center gap-2 mb-2"><AlertTriangle className="w-4 h-4" /> 필수 항목 누락</h3>{aiResults.missingSections?.length > 0 ? (<div className="space-y-2">{aiResults.missingSections.map(s => (<button key={s.id} onClick={() => scrollToField(s.field)} className="block w-full text-left p-2 rounded hover:bg-yellow-100 transition-all"><p className="text-yellow-700">🟡 누락됨: {s.message}</p></button>))}</div>) : (<p className="text-green-700 flex items-center gap-1"><CheckCircle className="w-4 h-4" /> 모든 필수 항목이 포함되었습니다.</p>)}</div><div className="bg-blue-50 border border-blue-200 rounded-lg p-3"><h3 className="font-bold text-blue-800 flex items-center gap-2 mb-2"><Bot className="w-4 h-4" /> 문맥 오류 (GPT)</h3><div className="space-y-3">{aiResults.contextualErrors?.map(c => (<div key={c.id} className="p-3 bg-white rounded border border-blue-200"><p onClick={() => scrollToField(c.field)} className="font-semibold cursor-pointer hover:text-blue-600 transition-colors">{c.claim}</p><pre className="mt-2 whitespace-pre-wrap text-gray-700 text-xs">{c.analysis}</pre>{c.suggestion && (<div className="mt-3 pt-3 border-t border-blue-200"><p className="text-xs text-gray-500 mb-1">AI 수정 제안:</p><p className="text-xs text-blue-700 italic mb-2">"{c.suggestion}"</p><button onClick={() => applyAiSuggestion(c.claimIndex, c.suggestion)} className="w-full px-3 py-2 text-xs font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-all flex items-center justify-center gap-1"><CheckCircle className="w-3 h-3" /> 이대로 수정</button></div>)}</div>))}</div></div></div>)}
              </div>
              <div className="space-y-3">
                <button onClick={() => alert('3D 변환 기능 구현 예정')} className="w-full flex items-center justify-center gap-2 px-4 py-3 font-semibold text-white bg-indigo-500 rounded-lg hover:bg-indigo-600 transition-all"><Box className="w-4 h-4" /> 도면 3D 변환</button>
                <button onClick={handleAiCheck} disabled={aiCheckMutation.isPending} className="w-full flex items-center justify-center gap-2 px-4 py-3 font-semibold text-white bg-green-500 rounded-lg hover:bg-green-600 disabled:bg-gray-400 transition-all"><Bot className="w-4 h-4" /> {aiCheckMutation.isPending ? '분석 중...' : 'AI 서류 검토 시작'}</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentEditor;
