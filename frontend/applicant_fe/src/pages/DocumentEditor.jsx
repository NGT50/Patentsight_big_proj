import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getLatestDocument, updateDocument, validatePatentDocument } from '../api/patents';
import { 
  FileText, 
  Save, 
  Download, 
  Send, 
  Bot, 
  Box, 
  CheckCircle, 
  AlertCircle, 
  X,
  Plus,
  Trash2,
  Eye,
  Edit3,
  Clock,
  CheckSquare,
  AlertTriangle
} from 'lucide-react';

// ADDED: DocumentEditor 테스트를 위한 가짜 문서 데이터
const mockPatentDocument = {
  document: {
    title: '테스트용 스마트 잠금장치',
    technicalField: '본 발명은 스마트폰과 연동되는 잠금장치에 관한 것이다.',
    backgroundTechnology: '기존의 기계식 잠금장치는 분실 위험이 크고 원격 제어가 불가능했다.',
    inventionDetails: {
      problemToSolve: '원격으로 제어하고 상태를 확인할 수 있는 스마트 잠금장치의 부재.',
      solution: 'BLE 통신 모듈과 GPS를 탑재하여 스마트폰 앱으로 제어한다.',
      effect: '도난 방지 및 사용자 편의성 증대.',
    },
    summary: 'BLE와 GPS를 이용한 스마트폰 연동형 잠금장치.',
    drawingDescription: '도 1은 본 발명의 전체 구성도이다.',
    claims: ['BLE 통신 모듈을 포함하는 스마트 잠금장치.', '상기 잠금장치는 GPS 모듈을 더 포함하는 것을 특징으로 하는 스마트 잠금장치.'],
  }
};

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
const mockAiResults = {
  formatErrors: [
    { id: 'err_fe_1', message: "❗ 청구항 번호가 중복되어 있습니다.", field: 'claims' }
  ],
  missingSections: [
    { id: 'err_ms_1', message: "배경기술", field: 'backgroundTechnology' }
  ],
  contextualErrors: [
    { 
      id: 'err_ce_1', 
      claim: "청구항 1",
      claimIndex: 0, // 수정할 청구항의 인덱스 (0부터 시작)
      analysis: "- 발견된 문제: '고정부'와 '결합부'의 관계가 불명확합니다...",
      suggestion: "'상기 고정부는 상기 결합부와 일체로 형성되는 것을 특징으로 하는 스마트 잠금장치.'" // AI가 제안하는 수정 텍스트
    },
    {
      id: 'err_ce_2',
      claim: "청구항 3",
      claimIndex: 2,
      analysis: "✅ 논리적 비약이나 문맥상 오류가 발견되지 않았습니다. 잘 작성되었습니다."
      // 수정 제안이 없으므로 suggestion 필드도 없음
    }
  ],
};

const DocumentEditor = () => {
  const fieldRefs = useRef({});
  const [activeTab, setActiveTab] = useState('details');
  const navigate = useNavigate();
  const { id: patentId } = useParams();
  const [document, setDocument] = useState(initialDocumentState);
  const [aiResults, setAiResults] = useState(null);
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['patentDocument', patentId],
    queryFn: async () => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return { document: mockPatentDocument.document }; // Mock data for testing
    },
    enabled: !!patentId,
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
    if (data?.document) {
      const docFromServer = data.document;
      const initialState = {
        ...initialDocumentState, ...docFromServer,
        inventionDetails: { ...initialDocumentState.inventionDetails, ...docFromServer.inventionDetails },
        claims: docFromServer.claims && docFromServer.claims.length > 0 ? docFromServer.claims : [''],
      };
      setDocument(initialState);
    }
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: updateDocument,
    onSuccess: () => {
      queryClient.invalidateQueries(['patentDocument', patentId]);
      alert('임시저장이 완료되었습니다.');
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
      // 테스트용으로 Mock 데이터를 설정
      setAiResults(mockAiResults);
    },
  });

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

  const handleSaveDraft = () => saveMutation.mutate({ patentId, documentData: document });
  const handleAiCheck = () => aiCheckMutation.mutate(patentId);

  const scrollToField = (fieldName) => {
    const fieldElement = fieldRefs.current[fieldName];
    if (fieldElement) {
      fieldElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      fieldElement.style.backgroundColor = '#fef3c7';
      setTimeout(() => {
        fieldElement.style.backgroundColor = '';
      }, 2000);
    }
  };

  if (isLoading) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">문서 데이터를 불러오는 중입니다...</p>
      </div>
    </div>
  );
  
  if (isError) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-gray-50 flex items-center justify-center">
      <div className="text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600">에러 발생: {error.message}</p>
      </div>
    </div>
  );

  const renderTabs = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <nav className="flex space-x-8" aria-label="Tabs">
        <button 
          onClick={() => setActiveTab('details')} 
          className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all ${
            activeTab === 'details' 
              ? 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200' 
              : 'bg-blue-100 text-blue-700 border border-blue-200 hover:bg-blue-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          발명의 상세한 설명
        </button>
        <button 
          onClick={() => setActiveTab('claims')} 
          className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all ${
            activeTab === 'claims' 
              ? 'text-gray-700 hover:text-blue-500 hover:bg-gray-50 border border-transparent' 
              : 'bg-blue-100 text-blue-700 border border-blue-200 hover:bg-blue-200'
          }`}
        >
          <Edit3 className="w-4 h-4" />
          청구범위
        </button>
        <button 
          onClick={() => setActiveTab('summary')} 
          className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all ${
            activeTab === 'summary' 
              ? 'text-gray-700 hover:text-blue-500 hover:bg-gray-50 border border-transparent' 
              : 'bg-blue-100 text-blue-700 border border-blue-200 hover:bg-blue-200'
          }`}
        >
          <Eye className="w-4 h-4" />
          요약 및 기타
        </button>
      </nav>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* 헤더 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{document.title || "제목 없는 출원서"}</h1>
              <p className="text-gray-600 mt-1">출원서 편집기</p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={handleSaveDraft} 
                disabled={saveMutation.isPending} 
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 disabled:bg-gray-200 disabled:cursor-not-allowed transition-all"
              >
                <Save className="w-4 h-4" />
                {saveMutation.isPending ? '저장 중...' : '임시저장'}
              </button>
              <button 
                onClick={() => alert('다운로드 기능 구현 예정')} 
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-all"
              >
                <Download className="w-4 h-4" />
                다운로드
              </button>
              <button 
                onClick={() => navigate(`/submit/${patentId}`)} 
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-sm hover:from-blue-600 hover:to-blue-700 transition-all"
              >
                <Send className="w-4 h-4" />
                최종 제출
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 메인 편집 영역 */}
          <div className="lg:col-span-2">
            {renderTabs()}
            
            <div className="space-y-6">
              {activeTab === 'details' && (
                <div className="space-y-6">
                  <div ref={el => fieldRefs.current['title'] = el} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <label className="block text-lg font-semibold text-gray-800 mb-3">발명의 명칭</label>
                    <input 
                      type="text" 
                      name="title" 
                      value={document.title} 
                      onChange={handleInputChange} 
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="발명의 명칭을 입력하세요"
                    />
                  </div>
                  
                  <div ref={el => fieldRefs.current['technicalField'] = el} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <label className="block text-lg font-semibold text-gray-800 mb-3">기술분야</label>
                    <textarea 
                      name="technicalField" 
                      value={document.technicalField} 
                      onChange={handleInputChange} 
                      rows="5" 
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                      placeholder="발명이 속하는 기술분야를 설명하세요"
                    />
                  </div>
                  
                  <div ref={el => fieldRefs.current['backgroundTechnology'] = el} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <label className="block text-lg font-semibold text-gray-800 mb-3">배경기술</label>
                    <textarea 
                      name="backgroundTechnology" 
                      value={document.backgroundTechnology} 
                      onChange={handleInputChange} 
                      rows="5" 
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                      placeholder="관련된 배경기술을 설명하세요"
                    />
                  </div>
                  
                  <div ref={el => fieldRefs.current['inventionDetails'] = el} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">발명의 상세한 설명</h3>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-md font-medium text-gray-700 mb-2">해결하려는 과제</label>
                        <textarea 
                          name="problemToSolve" 
                          value={document.inventionDetails.problemToSolve} 
                          onChange={handleNestedInputChange} 
                          rows="4" 
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                          placeholder="해결하려는 기술적 과제를 설명하세요"
                        />
                      </div>
                      <div>
                        <label className="block text-md font-medium text-gray-700 mb-2">과제의 해결 수단</label>
                        <textarea 
                          name="solution" 
                          value={document.inventionDetails.solution} 
                          onChange={handleNestedInputChange} 
                          rows="4" 
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                          placeholder="과제를 해결하는 수단을 설명하세요"
                        />
                      </div>
                      <div>
                        <label className="block text-md font-medium text-gray-700 mb-2">발명의 효과</label>
                        <textarea 
                          name="effect" 
                          value={document.inventionDetails.effect} 
                          onChange={handleNestedInputChange} 
                          rows="4" 
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                          placeholder="발명의 효과를 설명하세요"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'claims' && (
                <div ref={el => fieldRefs.current['claims'] = el} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <label className="block text-lg font-semibold text-gray-800">청구범위</label>
                    <button 
                      onClick={addClaim} 
                      className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      청구항 추가
                    </button>
                  </div>
                  <div className="space-y-6">
                    {document.claims.map((claim, index) => (
                      <div key={index} className="relative p-4 border border-gray-200 rounded-lg bg-gray-50">
                        <div className="flex items-center justify-between mb-3">
                          <label className="block text-sm font-medium text-gray-700">청구항 {index + 1}</label>
                          {document.claims.length > 1 && (
                            <button 
                              onClick={() => removeClaim(index)} 
                              className="flex items-center gap-1 px-2 py-1 text-xs text-red-600 hover:bg-red-100 rounded-md transition-all"
                            >
                              <Trash2 className="w-3 h-3" />
                              삭제
                            </button>
                          )}
                        </div>
                        <textarea 
                          value={claim} 
                          onChange={(e) => handleClaimChange(index, e.target.value)} 
                          rows="4" 
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none bg-white"
                          placeholder={`청구항 ${index + 1}의 내용을 입력하세요`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {activeTab === 'summary' && (
                <div className="space-y-6">
                  <div ref={el => fieldRefs.current['summary'] = el} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <label className="block text-lg font-semibold text-gray-800 mb-3">요약</label>
                    <textarea 
                      name="summary" 
                      value={document.summary} 
                      onChange={handleInputChange} 
                      rows="5" 
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                      placeholder="발명의 요약을 입력하세요"
                    />
                  </div>
                  <div ref={el => fieldRefs.current['drawingDescription'] = el} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <label className="block text-lg font-semibold text-gray-800 mb-3">도면의 간단한 설명</label>
                    <textarea 
                      name="drawingDescription" 
                      value={document.drawingDescription} 
                      onChange={handleInputChange} 
                      rows="5" 
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                      placeholder="도면에 대한 간단한 설명을 입력하세요"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* AI 어시스턴트 사이드바 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-8">
              <div className="flex items-center gap-2 mb-4">
                <Bot className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-bold text-gray-800">AI 어시스턴트</h2>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6 min-h-[400px] max-h-[500px] overflow-y-auto">
                {aiCheckMutation.isPending && (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                      <p className="text-gray-600">AI가 문서를 분석 중입니다...</p>
                    </div>
                  </div>
                )}
                
                {!aiCheckMutation.isPending && !aiResults && (
                  <div className="text-center text-gray-500">
                    <Bot className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <p>'AI 서류 검토 시작' 버튼을 눌러주세요.</p>
                  </div>
                )}
                
                {aiResults && (
                  <div className="space-y-4 text-sm">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <h3 className="font-bold text-red-800 flex items-center gap-2 mb-2">
                        <AlertCircle className="w-4 h-4" />
                        형식 오류
                      </h3>
                      {aiResults.formatErrors?.length > 0 ? (
                        <div className="space-y-2">
                          {aiResults.formatErrors.map(e => (
                            <button 
                              key={e.id} 
                              onClick={() => scrollToField(e.field)} 
                              className="block w-full text-left p-2 rounded hover:bg-red-100 transition-all"
                            >
                              <p className="text-red-700">{e.message}</p>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className="text-green-700 flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" />
                          형식 오류가 발견되지 않았습니다.
                        </p>
                      )}
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <h3 className="font-bold text-yellow-800 flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-4 h-4" />
                        필수 항목 누락
                      </h3>
                      {aiResults.missingSections?.length > 0 ? (
                        <div className="space-y-2">
                          {aiResults.missingSections.map(s => (
                            <button 
                              key={s.id} 
                              onClick={() => scrollToField(s.field)} 
                              className="block w-full text-left p-2 rounded hover:bg-yellow-100 transition-all"
                            >
                              <p className="text-yellow-700">🟡 누락됨: {s.message}</p>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className="text-green-700 flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" />
                          모든 필수 항목이 포함되었습니다.
                        </p>
                      )}
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <h3 className="font-bold text-blue-800 flex items-center gap-2 mb-2">
                        <Bot className="w-4 h-4" />
                        문맥 오류 (GPT)
                      </h3>
                      <div className="space-y-3">
                        {aiResults.contextualErrors?.map(c => (
                          <div key={c.id} className="p-3 bg-white rounded border border-blue-200">
                            <p 
                              onClick={() => scrollToField(c.field)} 
                              className="font-semibold cursor-pointer hover:text-blue-600 transition-colors"
                            >
                              {c.claim}
                            </p>
                            <pre className="mt-2 whitespace-pre-wrap text-gray-700 text-xs">{c.analysis}</pre>
                            
                            {c.suggestion && (
                              <div className="mt-3 pt-3 border-t border-blue-200">
                                <p className="text-xs text-gray-500 mb-1">AI 수정 제안:</p>
                                <p className="text-xs text-blue-700 italic mb-2">"{c.suggestion}"</p>
                                <button 
                                  onClick={() => applyAiSuggestion(c.claimIndex, c.suggestion)}
                                  className="w-full px-3 py-2 text-xs font-semibold text-white bg-gradient-to-r from-green-500 to-green-600 rounded-lg hover:from-green-600 hover:to-green-700 transition-all flex items-center justify-center gap-1"
                                >
                                  <CheckCircle className="w-3 h-3" />
                                  이대로 수정
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="space-y-3">
                <button 
                  onClick={() => alert('3D 변환 기능 구현 예정')} 
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 font-semibold text-white bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg hover:from-indigo-600 hover:to-indigo-700 transition-all"
                >
                  <Box className="w-4 h-4" />
                  도면 3D 변환
                </button>
                <button 
                  onClick={handleAiCheck} 
                  disabled={aiCheckMutation.isPending} 
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 font-semibold text-white bg-gradient-to-r from-green-500 to-green-600 rounded-lg hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 transition-all"
                >
                  <Bot className="w-4 h-4" />
                  {aiCheckMutation.isPending ? '분석 중...' : 'AI 서류 검토 시작'}
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