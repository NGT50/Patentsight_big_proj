import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  submitPatent,
  getPatentDetail,
  updateDocument,
  validatePatentDocument,
  generateFullDraft,
  generate3DModel,
  startChatSession,
  sendMessageToSession,
} from '../api/patents';
import { uploadFile, getFileDetail, toAbsoluteFileUrl } from '../api/files';
import {
  FileText, Save, Send, Bot, Box, CheckCircle, AlertCircle,
  Plus, Trash2, Eye, Edit3, AlertTriangle, Image
} from 'lucide-react';

import GenerateDraftModal from '../pages/GenerateDraftModal';
import Button from '../components/Button';
import ThreeDModelViewer from '../components/ThreeDModelViewer';
import ChatPanel from '../components/ChatPanel';
import { initialDocumentState } from '../utils/documentState';

const DocumentEditor = () => {
  // --- 1. Hooks 및 State 선언 ---
  const { id: patentId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const fieldRefs = useRef({});
  const isDataLoadedFromServerRef = useRef(false);

  const [document, setDocument] = useState(initialDocumentState);
  const [activeTab, setActiveTab] = useState('details');
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  
  // 파일 및 도면 관련 State
  const [drawingFiles, setDrawingFiles] = useState([]);
  const [modelFile, setModelFile] = useState(null);
  const [selectedDrawingId, setSelectedDrawingId] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [attachedPdf, setAttachedPdf] = useState(null);

  // 챗봇 관련 State
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [aiResults, setAiResults] = useState(null);

  const selectedImageIndex = drawingFiles.findIndex(
    (f) => f.fileId === selectedDrawingId,
  );

  // --- 2. 데이터 Fetching (React Query) ---
  const { data, isLoading, isError } = useQuery({
    queryKey: ['patentDetail', patentId],
    queryFn: () => getPatentDetail(patentId),
    enabled: !!patentId && patentId !== 'new-from-pdf',
  });

  // --- 3. Mutations ---
  const saveMutation = useMutation({
    mutationFn: updateDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myPatents'] });
      queryClient.invalidateQueries({ queryKey: ['patentDetail', patentId] });
      alert('임시저장이 완료되었습니다.');
    },
    onError: (error) => alert('저장 중 오류가 발생했습니다: ' + error.message),
  });

  const submitMutation = useMutation({
    mutationFn: async ({ patentId, documentData }) => {
      await updateDocument({ patentId, documentData });
      return await submitPatent(patentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myPatents'] });
      alert('출원서가 최종 제출되었습니다. 마이페이지로 이동합니다.');
      navigate('/mypage');
    },
    onError: (error) => alert('최종 제출 중 오류가 발생했습니다: ' + error.message),
  });

  const generateDraftMutation = useMutation({
    mutationFn: generateFullDraft,
    onSuccess: (generatedData) => {
      setDocument(prev => ({ ...prev, ...generatedData }));
      setIsGeneratorOpen(false);
      alert('AI 초안 생성이 완료되었습니다.');
    },
    onError: (err) => alert(`초안 생성 중 오류가 발생했습니다: ${err.message}`),
  });
  
  const startChatMutation = useMutation({
    mutationFn: startChatSession,
    onSuccess: (data) => {
      setSessionId(data.sessionId);
      setMessages([{ sender: 'ai', content: '안녕하세요! 특허 문서 검토를 도와드릴 준비가 되었습니다. 무엇이 궁금하신가요?' }]);
    },
    onError: (error) => {
      setMessages([{ sender: 'ai', content: `AI 어시스턴트 연결에 실패했습니다: ${error.message}` }]);
    }
  });

  const sendMessageMutation = useMutation({
    mutationFn: sendMessageToSession,
    onSuccess: (data) => {
      setMessages(prev => [...prev, data]);
    },
    onError: (error) => {
      setMessages(prev => [...prev, { sender: 'ai', content: `오류가 발생했습니다: ${error.message}` }]);
    },
    onSettled: () => {
      setIsAiTyping(false);
    }
  });

  const aiCheckMutation = useMutation({
    mutationFn: validatePatentDocument,
    onSuccess: (results) => {
      setAiResults(results);
      alert('AI 서류 검토가 완료되었습니다.');
    },
    onError: (error) => alert(`AI 서류 검토 중 오류가 발생했습니다: ${error.message}`),
  });

  // --- 4. Side Effects (useEffect) ---
  useEffect(() => {
    const preloadedData = location.state?.parsedData;
    const originalFile = location.state?.originalFile;
    if (originalFile) setAttachedPdf(originalFile);

    if (preloadedData) {
      setDocument({ ...initialDocumentState, ...preloadedData });
      isDataLoadedFromServerRef.current = true;
      return;
    }
    if (data && !isDataLoadedFromServerRef.current) {
      const doc = data;
      setDocument({
        ...initialDocumentState,
        title: doc.title || "",
        technicalField: doc.technicalField || "",
        backgroundTechnology: doc.backgroundTechnology || "",
        inventionDetails: {
          problemToSolve: doc.inventionDetails?.problemToSolve || "",
          solution: doc.inventionDetails?.solution || "",
          effect: doc.inventionDetails?.effect || "",
        },
        summary: doc.summary || "",
        drawingDescription: doc.drawingDescription || "",
        claims: doc.claims && doc.claims.length > 0 ? doc.claims : [''],
      });
      isDataLoadedFromServerRef.current = true;
    }
  }, [data, location.state]);

  useEffect(() => {
    if (data?.attachmentIds?.length) {
      (async () => {
        try {
          const metas = await Promise.all(
            data.attachmentIds.map((id) => getFileDetail(id))
          );
          const images = metas
            .filter((m) => m.fileType === 'IMAGE')
            .map(({ fileId, fileUrl, fileName }) => ({ fileId, fileUrl, fileName }));
          setDrawingFiles(images);
          if (images.length > 0) {
            setSelectedDrawingId(images[0].fileId);
          }
          const glbMeta = metas.find((m) => m.fileType === 'GLB');
          setModelFile(
            glbMeta ? {
              fileId: glbMeta.fileId,
              fileUrl: toAbsoluteFileUrl(`/api/files/${glbMeta.fileId}/content`),
              fileName: glbMeta.fileName,
            } : null
          );
        } catch (err) {
          console.error('첨부 파일 로딩 실패:', err);
        }
      })();
    } else {
      setDrawingFiles([]);
      setModelFile(null);
    }
  }, [data]);

  useEffect(() => {
    isDataLoadedFromServerRef.current = false;
  }, [patentId]);

  useEffect(() => {
    if (patentId && patentId !== 'new-from-pdf') {
      setMessages([]);
      startChatMutation.mutate(patentId);
    }
  }, [patentId]);

  // --- 5. 핸들러 및 유틸리티 함수 ---
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
      setDocument(prev => ({ ...prev, claims: prev.claims.filter((_, i) => i !== index) }));
    }
  };

  const handleDrawingUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;
    setIsUploading(true);
    setUploadError(null);
    try {
      const uploaded = await Promise.all(
        files.map(file => uploadFile({ file, patentId }))
      );
      setDrawingFiles(prev => [...prev, ...uploaded]);
      if (!selectedDrawingId && uploaded.length > 0) {
        setSelectedDrawingId(uploaded[0].fileId);
      }
    } catch (error) {
      console.error('도면 업로드 실패:', error);
      setUploadError('도면 업로드에 실패했습니다.');
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };
  
  const handleSaveDraft = () => saveMutation.mutate({ patentId, documentData: document });
  const handleSubmit = () => {
    if (window.confirm('정말로 최종 제출하시겠습니까? 제출 후에는 수정이 어렵습니다.')) {
      submitMutation.mutate({ patentId, documentData: document });
    }
  };

  const handleGenerateDraft = (title) => generateDraftMutation.mutate({ title });
  
  const handleGenerate3D = async () => {
    const target = drawingFiles.find((f) => f.fileId === selectedDrawingId);
    if (!target) {
      return alert('3D로 변환할 도면을 선택해주세요.');
    }
    try {
      const { fileId } = await generate3DModel({ patentId, imageId: target.fileId });
      setModelFile({ fileId, fileUrl: toAbsoluteFileUrl(`/api/files/${fileId}/content`), fileName: 'model.glb' });
      alert('3D 도면 생성이 완료되었습니다.');
    } catch (err) {
      console.error('3D 변환 실패:', err);
      alert('3D 변환 중 오류가 발생했습니다.');
    }
  };

  const handleAiCheck = () => {
    if (patentId) {
      aiCheckMutation.mutate(patentId);
    } else {
      alert("문서를 먼저 저장해주세요.");
    }
  };
  
  const handleSendMessage = (content) => {
    if (!sessionId) return alert("채팅 세션이 아직 준비되지 않았습니다.");
    const userMessage = { sender: 'user', content };
    setMessages(prev => [...prev, userMessage]);
    setIsAiTyping(true);
    sendMessageMutation.mutate({ sessionId, content, documentData: document });
  };

  const applyAiSuggestion = (claimIndex, suggestionText) => {
    const newClaims = [...document.claims];
    newClaims[claimIndex] = suggestionText;
    setDocument(prev => ({ ...prev, claims: newClaims }));
  };

  const scrollToField = (fieldName) => {
    fieldRefs.current[fieldName]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };
  
  // --- 6. 렌더링 로직 ---
  if (isLoading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p>출원서 정보를 불러오는 중입니다...</p></div>;
  if (isError) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p>오류가 발생했습니다. 페이지를 새로고침 해주세요.</p></div>;

  const tabsData = [
    { id: 'details', label: '발명의 상세한 설명', Icon: FileText },
    { id: 'claims', label: '청구범위', Icon: Edit3 },
    { id: 'summary', label: '요약 및 기타', Icon: Eye },
    { id: 'drawings', label: '도면', Icon: Image },
  ];
  
  const renderTabs = () => {
    const baseClasses = "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all";
    const activeClasses = "bg-blue-100 text-blue-700 border border-blue-200 hover:bg-blue-200";
    const inactiveClasses = "bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200";
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <nav aria-label="Tabs">
          <ul className="flex flex-wrap gap-4" role="tablist">
            {tabsData.map(tab => (
              <li key={tab.id} role="presentation">
                <button
                  onClick={() => setActiveTab(tab.id)}
                  className={`${baseClasses} ${activeTab === tab.id ? activeClasses : inactiveClasses}`}
                  role="tab"
                  aria-selected={activeTab === tab.id}
                >
                  <tab.Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {isGeneratorOpen && (
        <GenerateDraftModal
          onClose={() => setIsGeneratorOpen(false)}
          onGenerate={handleGenerateDraft}
          isLoading={generateDraftMutation.isPending}
        />
      )}
      <div className="max-w-screen-xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{document.title || "제목 없는 출원서"}</h1>
              <p className="text-gray-600 mt-1">출원서 편집기</p>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={() => setIsGeneratorOpen(true)} variant="special" className="w-auto">
                ✨ AI로 전체 초안 생성
              </Button>
              <button onClick={handleSaveDraft} disabled={saveMutation.isPending} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 disabled:bg-gray-200 transition-all">
                <Save className="w-4 h-4" /> {saveMutation.isPending ? '저장 중...' : '임시저장'}
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitMutation.isPending}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 transition-all disabled:bg-gray-400"
              >
                <Send className="w-4 h-4" />
                {submitMutation.isPending ? '제출 중...' : '최종 제출'}
              </button>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {renderTabs()}
            <div className="space-y-6">
              {activeTab === 'details' && (
                <div className="space-y-6">
                  <div ref={el => fieldRefs.current['title'] = el} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"><label className="block text-lg font-semibold text-gray-800 mb-3">발명의 명칭</label><input type="text" name="title" value={document.title} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" placeholder="발명의 명칭을 입력하세요" /></div>
                  <div ref={el => fieldRefs.current['technicalField'] = el} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"><label className="block text-lg font-semibold text-gray-800 mb-3">기술분야</label><textarea name="technicalField" value={document.technicalField} onChange={handleInputChange} rows="5" className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none" placeholder="발명이 속하는 기술분야를 설명하세요" /></div>
                  <div ref={el => fieldRefs.current['backgroundTechnology'] = el} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"><label className="block text-lg font-semibold text-gray-800 mb-3">배경기술</label><textarea name="backgroundTechnology" value={document.backgroundTechnology} onChange={handleInputChange} rows="5" className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none" placeholder="관련된 배경기술을 설명하세요" /></div>
                  <div ref={el => fieldRefs.current['inventionDetails'] = el} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"><h3 className="text-lg font-semibold text-gray-800 mb-4">발명의 상세한 설명</h3><div className="space-y-6"><div><label className="block text-md font-medium text-gray-700 mb-2">해결하려는 과제</label><textarea name="problemToSolve" value={document.inventionDetails.problemToSolve} onChange={handleNestedInputChange} rows="4" className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none" placeholder="해결하려는 기술적 과제를 설명하세요" /></div><div><label className="block text-md font-medium text-gray-700 mb-2">과제의 해결 수단</label><textarea name="solution" value={document.inventionDetails.solution} onChange={handleNestedInputChange} rows="4" className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none" placeholder="과제를 해결하는 수단을 설명하세요" /></div><div><label className="block text-md font-medium text-gray-700 mb-2">발명의 효과</label><textarea name="effect" value={document.inventionDetails.effect} onChange={handleNestedInputChange} rows="4" className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none" placeholder="발명의 효과를 설명하세요" /></div></div></div>
                </div>
              )}
              {activeTab === 'claims' && (
                <div ref={el => fieldRefs.current['claims'] = el} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6"><label className="block text-lg font-semibold text-gray-800">청구범위</label><button onClick={addClaim} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all"><Plus className="w-4 h-4" /> 청구항 추가</button></div>
                  <div className="space-y-6">{document.claims.map((claim, index) => (<div key={index} className="relative p-4 border border-gray-200 rounded-lg bg-gray-50"><div className="flex items-center justify-between mb-3"><label className="block text-sm font-medium text-gray-700">청구항 {index + 1}</label>{document.claims.length > 1 && (<button onClick={() => removeClaim(index)} className="flex items-center gap-1 px-2 py-1 text-xs text-red-600 hover:bg-red-100 rounded-md transition-all"><Trash2 className="w-3 h-3" /> 삭제</button>)}</div><textarea value={claim} onChange={(e) => handleClaimChange(index, e.target.value)} rows="4" className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none bg-white" placeholder={`청구항 ${index + 1}의 내용을 입력하세요`} /></div>))}</div>
                </div>
              )}
              {activeTab === 'summary' && (
                <div className="space-y-6">
                  <div ref={el => fieldRefs.current['summary'] = el} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"><label className="block text-lg font-semibold text-gray-800 mb-3">요약</label><textarea name="summary" value={document.summary} onChange={handleInputChange} rows="5" className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none" placeholder="발명의 요약을 입력하세요" /></div>
                  <div ref={el => fieldRefs.current['drawingDescription'] = el} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"><label className="block text-lg font-semibold text-gray-800 mb-3">도면의 간단한 설명</label><textarea name="drawingDescription" value={document.drawingDescription} onChange={handleInputChange} rows="5" className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none" placeholder="도면에 대한 간단한 설명을 입력하세요" /></div>
                </div>
              )}
              {activeTab === 'drawings' && (
                <div ref={el => fieldRefs.current['drawings'] = el} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-lg font-semibold text-gray-800">도면 업로드</label>
                    {drawingFiles.length > 0 && (
                      <span className="text-xs text-gray-500">
                        선택된 도면: {selectedImageIndex >= 0 ? selectedImageIndex + 1 : '-'} / {drawingFiles.length}
                      </span>
                    )}
                  </div>
                  <input type="file" multiple accept="image/png, image/jpeg" onChange={handleDrawingUpload} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                  {isUploading && <p className="text-sm text-gray-500 mt-2">업로드 중...</p>}
                  {uploadError && <p className="text-sm text-red-500 mt-2">{uploadError}</p>}
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    {drawingFiles.map((f, index) => (
                      <div
                        key={f.fileId || index}
                        onClick={() => setSelectedDrawingId(f.fileId)}
                        className={`relative border rounded-lg overflow-hidden flex items-center justify-center p-2 cursor-pointer ${f.fileId === selectedDrawingId ? 'ring-2 ring-indigo-500' : ''}`}
                      >
                        <img
                          src={f.fileUrl}
                          alt={`도면 미리보기 ${index + 1}`}
                          className="w-full h-auto object-cover"
                        />
                        {f.fileId === selectedDrawingId && (
                          <span className="absolute top-1 right-1 text-[10px] px-1.5 py-0.5 bg-indigo-600 text-white rounded">선택됨</span>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="mt-6">
                    <label className="block text-lg font-semibold text-gray-800 mb-2">3D 모델</label>
                    {modelFile ? (
                      <ThreeDModelViewer src={modelFile.fileUrl} />
                    ) : (
                      <p className="text-sm text-gray-500">생성된 3D 모델이 없습니다.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-8 flex flex-col h-[calc(100vh-4rem)]">
              <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-200">
                <Bot className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-bold text-gray-800">AI 어시스턴트</h2>
              </div>
              <div className="flex-grow overflow-hidden">
                <ChatPanel
                  messages={messages}
                  onSendMessage={handleSendMessage}
                  isTyping={isAiTyping}
                  initialLoading={startChatMutation.isPending}
                />
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                <button
                  onClick={handleGenerate3D}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 font-semibold text-white bg-indigo-500 rounded-lg hover:bg-indigo-600 transition-all"
                >
                  <Box className="w-4 h-4" /> 도면 3D 변환
                </button>
                <button
                  onClick={handleAiCheck}
                  disabled={aiCheckMutation.isPending}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 font-semibold text-white bg-green-500 rounded-lg hover:bg-green-600 disabled:bg-gray-400 transition-all"
                >
                  <Bot className="w-4 h-4" />
                  {aiCheckMutation.isPending ? '분석 중...' : 'AI 서류 검토'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentEditor;