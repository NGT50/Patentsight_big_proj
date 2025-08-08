import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getMyPatents } from '../api/patents';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Search, 
  Filter, 
  Clock, 
  Calendar, 
  User, 
  FlaskConical,
  Bell,
  Plus,
  Eye,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const MyPage = () => {
  const navigate = useNavigate();
  
  // Mock 데이터 (테스트용) 2
  const mockPatents = [
    { 
      patentId: 101, 
      title: '첫 번째 테스트 특허: 스마트 잠금장치',
      status: '심사중',
      applicant: '홍길동',
      applicationDate: '2024-01-15',
      ipc: 'E05B 47/00',
      cpc: 'E05B2047/0012',
      summary: 'IoT 기반 스마트 잠금 시스템'
    },
    { 
      patentId: 102, 
      title: '두 번째 테스트 특허: AI 기반 번역 시스템',
      status: '심사대기',
      applicant: '김철수',
      applicationDate: '2024-02-20',
      ipc: 'G06F 17/28',
      cpc: 'G06F40/58',
      summary: '실시간 다국어 번역 AI 시스템'
    },
  ];
  
  const patents = mockPatents;
  const isLoading = false;
  const isError = false;
  const error = null;

  const handleCardClick = (patentId) => {
    navigate(`/patent/${patentId}`);
  };

  const handleCreatePatent = () => {
    navigate('/patent/new');
  };

  // 통계 계산
  const totalPatents = patents.length;
  const pendingPatents = patents.filter(p => p.status === '심사중').length;
  const waitingPatents = patents.filter(p => p.status === '심사대기').length;
  const completedPatents = patents.filter(p => p.status === '심사완료').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* 환영 메시지 섹션 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">AI와 함께, 출원부터 보완까지 손쉽게</h1>
          <p className="text-gray-600">Patentsight AI 어시스턴트가 복잡한 특허 출원 과정을 도와드립니다.</p>
        </div>

        {/* 통계 카드 섹션 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">전체 출원</p>
                <p className="text-2xl font-bold text-gray-900">{totalPatents}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">심사중</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingPatents}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">심사대기</p>
                <p className="text-2xl font-bold text-blue-600">{waitingPatents}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
          <div>
                <p className="text-sm text-gray-600 mb-1">심사완료</p>
                <p className="text-2xl font-bold text-green-600">{completedPatents}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 메인 기능 섹션 */}
          <div className="lg:col-span-2">
            {/* 기능 버튼 그리드 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">빠른 기능</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button 
                  onClick={() => alert("특허 점검 이동")}
                  className="flex flex-col items-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 hover:from-blue-100 hover:to-blue-200 transition-all group"
                >
                  <FlaskConical className="w-8 h-8 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium text-blue-800 text-center">특허, 실용신안 점검</span>
                </button>
                
                <button 
                  onClick={() => alert("디자인 점검 이동")}
                  className="flex flex-col items-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200 hover:from-purple-100 hover:to-purple-200 transition-all group"
                >
                  <Eye className="w-8 h-8 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium text-purple-800 text-center">디자인, 상표 점검</span>
                </button>
                
                <button 
                  onClick={() => alert("보관함 이동")}
                  className="flex flex-col items-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200 hover:from-green-100 hover:to-green-200 transition-all group"
                >
                  <FileText className="w-8 h-8 text-green-600 mb-2 group-hover:scale-110 transition-transform" />
                  <div className="text-center">
                    <span className="text-sm font-medium text-green-800 block">특허 보관함</span>
                    <span className="text-xs text-green-600">총 출원수: 3건</span>
                    <span className="text-xs text-green-600 block">보완요청: 1건</span>
                  </div>
                </button>
                
                <button 
                  onClick={handleCreatePatent}
                  className="flex flex-col items-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200 hover:from-orange-100 hover:to-orange-200 transition-all group"
                >
                  <Plus className="w-8 h-8 text-orange-600 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium text-orange-800 text-center">출원서 등록</span>
                </button>
              </div>
            </div>

            {/* 출원 목록 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">📄 나의 출원 목록</h2>
              
              {isLoading && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 mt-2">출원 목록을 불러오는 중입니다...</p>
                </div>
              )}
              
              {isError && (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-2" />
                  <p className="text-red-600">오류가 발생했습니다: {error?.message}</p>
                </div>
              )}
              
              {patents && patents.length === 0 && (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">출원 내역이 없습니다.</p>
                </div>
              )}
              
              {patents && patents.length > 0 && (
                <div className="space-y-4">
                  {patents.map((patent) => (
                    <div
                      key={patent.patentId}
                      onClick={() => handleCardClick(patent.patentId)}
                      className="flex w-full p-4 bg-gray-50 border border-gray-200 rounded-lg shadow-sm cursor-pointer hover:bg-gray-100 transition-all group"
                    >
                      <div className="flex-shrink-0 w-24 h-24 mr-4 bg-gray-200 rounded-md flex items-center justify-center">
                        <FileText className="w-8 h-8 text-gray-400" />
                      </div>
                      <div className="flex flex-col justify-center flex-1">
                        <h3 className="text-lg font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                          {patent.title}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                          <strong>IPC:</strong> {patent.ipc} | <strong>CPC:</strong> {patent.cpc}
                        </p>
                        <p className="text-xs text-gray-500">
                          <strong>출원번호:</strong> {patent.patentId} | <strong>출원일:</strong> {patent.applicationDate}
                        </p>
                        <p className="text-sm text-gray-700 mt-1">
                          <strong>출원인:</strong> {patent.applicant} | 
                          <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                            patent.status === '심사중' ? 'bg-yellow-100 text-yellow-800' :
                            patent.status === '심사대기' ? 'bg-blue-100 text-blue-800' :
                            patent.status === '심사완료' ? 'bg-green-100 text-green-700' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {patent.status}
                          </span>
                        </p>
                        <p className="mt-2 text-sm text-gray-600">📌 <em>{patent.summary}</em></p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 알림 패널 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Bell className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-bold text-gray-800">🔔 알림</h3>
              </div>
              <div className="space-y-4">
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800 font-medium">심사관으로부터 보완 요청이 왔습니다.</p>
                  <p className="text-xs text-red-600 mt-1">기한: 2025-08-25</p>
                </div>
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">특허 최종 심사가 완료되었습니다. 결과를 확인해주세요.</p>
                </div>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">새로운 특허 검색 결과가 있습니다.</p>
                </div>
              </div>
            </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default MyPage;
