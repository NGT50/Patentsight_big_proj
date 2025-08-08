import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar, User, Eye, ChevronDown, ChevronUp, Palette, Search, Filter, Clock,
  FileText, CheckCircle, Hash, Building2, AlertCircle, Zap
} from 'lucide-react';

import { designDetailMockData } from '../mocks/designDetailMock';

// 특허 대시보드의 Certificate와 유사하게, 디자인 등록 단계를 위한 아이콘 (가정)
// Lucide에 적합한 아이콘이 없다면 직접 정의하거나 다른 아이콘으로 대체
function DesignCertificate(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 8H2.5L2 11.5V22H19V11.5L14.5 8Z"/>
      <path d="M8.5 11.5V17.5" />
      <path d="M12 8.5V17.5" />
      <path d="M15.5 8.5V17.5" />
      <circle cx="10" cy="5" r="3" />
      <circle cx="17" cy="5" r="3" />
      <path d="M12.5 7.5L14 6" />
      <path d="M14.5 8L16 6.5" />
    </svg>
  );
}

// 디자인 진행 단계 정의 (특허 대시보드와 유사하게)
// 각 단계의 completed와 current는 렌더링 시 item.status에 따라 동적으로 결정됩니다.
const designStages = [
  // colorClass 추가: 각 단계별 고유한 색상 클래스 정의
  // bg-색상-100 (아이콘 배경), border-색상-500 (아이콘 테두리), text-색상-600 (아이콘 및 텍스트)
  { id: 'reception', name: '접수', icon: FileText, statusMatch: ['심사대기', '심사중', '심사완료', '보류'], colorClass: { bg: 'bg-blue-600', border: 'border-blue-600', text: 'text-blue-700' } },
  { id: 'waiting', name: '심사대기', icon: Clock, statusMatch: ['심사대기', '심사중', '심사완료', '보류'], colorClass: { bg: 'bg-purple-600', border: 'border-purple-600', text: 'text-purple-700' } },
  { id: 'examination', name: '심사중', icon: Search, statusMatch: ['심사중', '심사완료', '보류'], colorClass: { bg: 'bg-yellow-600', border: 'border-yellow-600', text: 'text-yellow-700' } },
  { id: 'decision', name: '심결', icon: CheckCircle, statusMatch: ['심사완료', '보류'], colorClass: { bg: 'bg-teal-600', border: 'border-teal-600', text: 'text-teal-700' } },
  { id: 'registration', name: '등록', icon: DesignCertificate, statusMatch: ['심사완료'], colorClass: { bg: 'bg-green-600', border: 'border-green-600', text: 'text-green-700' } }
];

const designData = Object.values(designDetailMockData).map((item) => ({
  ...item,
  // Assign statusColor based on actual status from mock data
  statusColor: item.status === '심사중'
    ? 'bg-yellow-100 text-yellow-800'
    : item.status === '심사완료'
      ? 'bg-green-100 text-green-700'
      : item.status === '심사대기'
        ? 'bg-blue-100 text-blue-800'
        : item.status === '보류'
          ? 'bg-red-100 text-red-700'
          : 'bg-gray-100 text-gray-800', // 기타 상태를 위한 기본값
  priority: item.id === 'D-2025-00002' ? 'high' : 'medium', // Example: AI 스피커를 우선심사로
  estimatedDays: Math.floor(Math.random() * 20) + 7, // 이 부분은 목 데이터에 estimatedDays가 없다면 랜덤으로 유지하거나, 목 데이터에 추가
}));

export default function DesignDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCard, setExpandedCard] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('all');

  const navigate = useNavigate();

  const filteredData = designData.filter(item => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.applicant.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      selectedFilter === 'all' ||
      (selectedFilter === 'pending' && item.status === '심사중') ||
      (selectedFilter === 'approved' && item.status === '심사완료') ||
      (selectedFilter === 'waiting' && item.status === '심사대기') ||
      (selectedFilter === 'onhold' && item.status === '보류');

    return matchesSearch && matchesFilter;
  });

  const handleCardExpand = (id) => {
    setExpandedCard(expandedCard === id ? null : id);
  };

  const handleDetailView = (id) => {
    navigate(`/designreview/${id}`);
  };

  // Calculate stats
  const totalDesigns = designData.length;
  const pendingDesigns = designData.filter(d => d.status === '심사중').length;
  const thisMonthReception = designData.filter(d => {
    const receptionDate = new Date(d.receptionDate);
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    return receptionDate.getMonth() === currentMonth && receptionDate.getFullYear() === currentYear;
  }).length;
  const averageReviewTime = '22.5일'; // 이 값은 여전히 하드코딩된 플레이스홀더입니다.

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-gray-50">
      

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search and Filter Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="디자인번호, 출원인, 디자인명으로 검색..."
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-3">
              <select
                className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
              >
                <option value="all">전체 상태</option>
                <option value="waiting">심사대기</option>
                <option value="pending">심사중</option>
                <option value="approved">심사완료</option>
                <option value="onhold">보류</option>
              </select>
              <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all flex items-center gap-2 font-medium border-0">
                <Filter className="w-4 h-4" />
                필터 적용
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">전체 디자인</p>
                <p className="text-2xl font-bold text-gray-900">{totalDesigns}</p>
              </div>
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Palette className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">심사중</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingDesigns}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">이번 달 접수</p>
                <p className="text-2xl font-bold text-green-600">{thisMonthReception}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">평균 심사기간</p>
                <p className="text-2xl font-bold text-purple-600">{averageReviewTime}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <User className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Design Cards */}
        <div className="space-y-4">
          {filteredData.length > 0 ? (
            filteredData.map((item) => {
              // 현재 아이템의 상태를 기반으로 진행 단계 completed 및 current 상태 업데이트
              const updatedDesignStages = designStages.map(stage => {
                let stageCompleted = false;
                let stageCurrent = false;

                switch (stage.id) {
                  case 'reception':
                    // 접수는 접수일이 있으면 완료
                    stageCompleted = !!item.receptionDate;
                    // '접수'는 접수가 완료되면 더 이상 '현재' 단계가 아님
                    // '현재' 단계는 '심사대기'부터 시작
                    stageCurrent = false;
                    break;
                  case 'waiting':
                    // 심사대기는 '심사중' 이상 상태면 완료
                    stageCompleted = ['심사중', '심사완료', '보류'].includes(item.status);
                    // 현재 상태가 '심사대기'면 current
                    stageCurrent = item.status === '심사대기';
                    break;
                  case 'examination':
                    // 심사중은 '심사완료'나 '보류' 상태면 완료
                    stageCompleted = ['심사완료', '보류'].includes(item.status);
                    // 현재 상태가 '심사중'이면 current
                    stageCurrent = item.status === '심사중';
                    break;
                  case 'decision':
                    // 심결은 '심사완료' 상태면 완료
                    stageCompleted = item.status === '심사완료';
                    // 심사완료 상태일 때 심결 단계가 깜빡이도록 설정
                    stageCurrent = item.status === '심사완료';
                    break;
                  case 'registration':
                    // 등록은 '심사완료' 상태면 완료 (심결까지 완료되어야 등록 가능)
                    // stageCompleted = item.status === '심사완료'; // 기존: 심사완료 시 등록까지 켜짐
                    // 등록은 별도의 '등록완료' 상태가 있어야 완료되는 것으로 간주하여, 현재는 심사완료 시 completed 되지 않도록 함.
                    // 만약 '등록완료' 상태가 있다면, 아래와 같이 변경할 수 있음: stageCompleted = item.status === '등록완료';
                    stageCompleted = false; // 심사완료 상태에서는 등록 단계를 completed로 켜지 않음
                    // 등록 단계는 심사완료 후 최종 완료를 나타내므로, 심사완료 상태에서는 current로 깜빡이지 않도록 함
                    stageCurrent = false;
                    break;
                  default:
                    break;
                }

                return {
                  ...stage,
                  completed: stageCompleted,
                  current: stageCurrent,
                };
              });

              // 진행률 계산 (목 데이터의 reviewProgress 사용)
              const progressPercentage = item.reviewProgress || 0; // reviewProgress가 없으면 0으로

              return (
                <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all">
                  {/* Card Header */}
                  <div
                    className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => handleCardExpand(item.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-sm font-mono text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                            {item.id}
                          </span>
                          <span className={`text-xs px-3 py-1 rounded-full font-medium ${item.statusColor}`}>
                            {item.status}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                          {item.title}
                        </h3>
                        <div className="flex items-center gap-6 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <span>{item.applicant}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>{item.receptionDate}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 ml-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDetailView(item.id);
                          }}
                          className="px-4 py-2 bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-lg hover:from-gray-500 hover:to-gray-600 transition-all flex items-center gap-2 text-sm font-medium border-0"
                        >
                          <Eye className="w-4 h-4" /> 
                          상세보기
                        </button>
                        {expandedCard === item.id ? (
                          <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content - 특허 대시보드와 유사한 새로운 카드형 + 타임라인 디자인 */}
                  {expandedCard === item.id && (
                    <div className="border-t border-gray-100 bg-gradient-to-r from-gray-50 to-indigo-50 p-6">
                      {/* 진행 상황 타임라인 */}
                      <div className="mb-6">
                        <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <Clock className="w-5 h-5 text-indigo-600" />
                          심사 진행 상황
                        </h4>
                        <div className="flex items-center justify-between bg-white rounded-lg p-4 shadow-sm">
                          {updatedDesignStages.map((stage, index) => (
                            <div key={stage.id} className="flex items-center">
                              <div className="flex flex-col items-center flex-shrink-0"> {/* flex-shrink-0 추가 */}
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                                  // 깜빡이는 효과를 위해 'current'를 먼저 확인하고, 그 다음 'completed'를 확인합니다.
                                  stage.current
                                    ? `${stage.colorClass.bg} ${stage.colorClass.border} text-white animate-pulse` // 현재 단계에서 깜빡임
                                    : stage.completed
                                      ? `${stage.colorClass.bg} ${stage.colorClass.border} text-white`
                                      : 'bg-gray-100 border-gray-300 text-gray-400'
                                }`}>
                                  <stage.icon className="w-5 h-5" width="20" height="20" />
                                </div>
                                <span className={`text-xs mt-2 font-medium text-center ${
                                  // 여기도 마찬가지로 'current'를 먼저 확인합니다.
                                  stage.current
                                    ? stage.colorClass.text
                                    : stage.completed
                                      ? stage.colorClass.text
                                      : 'text-gray-400'
                                }`}>
                                  {stage.name}
                                </span>
                              </div>
                              {index < updatedDesignStages.length - 1 && (
                                <div className={`flex-1 h-0.5 mx-4 ${
                                  stage.completed || (stage.current && updatedDesignStages[index + 1].completed) ? 'bg-green-300' : 'bg-gray-200'
                                }`} />
                              )}
                            </div>
                          ))}
                        </div>
                        {/* 예상 완료 시간 */}
                        <div className="mt-3 text-center">
                          <span className="text-sm text-gray-600">
                            예상 심사 완료: <span className="font-semibold text-indigo-600">{item.estimatedDays}일 후</span>
                          </span>
                        </div>
                      </div>

                      {/* 정보 카드들 */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        {/* 디자인 정보 카드 */}
                        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                          <div className="flex items-center gap-2 mb-3">
                            <Palette className="w-5 h-5 text-indigo-600" />
                            <h5 className="font-semibold text-gray-900">디자인 정보</h5>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <Hash className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">디자인번호:</span>
                              <span className="font-medium ml-auto">{item.id}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">접수일:</span>
                              <span className="font-medium ml-auto">{item.receptionDate}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">분류:</span>
                              <span className="font-medium ml-auto">{item.field}</span>
                            </div>
                          </div>
                        </div>

                        {/* 당사자 정보 카드 */}
                        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                          <div className="flex items-center gap-2 mb-3">
                            <User className="w-5 h-5 text-green-600" />
                            <h5 className="font-semibold text-gray-900">당사자 정보</h5>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">출원인:</span>
                            </div>
                            <div className="ml-6 font-medium text-gray-900">{item.applicant}</div>
                            <div className="flex items-center gap-2 mt-3">
                              <User className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">담당 심사관:</span>
                              <span className="font-medium ml-auto">{item.examiner}</span>
                            </div>
                          </div>
                        </div>

                        {/* 상태 정보 카드 */}
                        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                          <div className="flex items-center gap-2 mb-3">
                            <AlertCircle className="w-5 h-5 text-yellow-600" />
                            <h5 className="font-semibold text-gray-900">현재 상태</h5>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600">심사상태:</span>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${item.statusColor}`}>
                                {item.status}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600">우선순위:</span>
                              <span className="font-medium">
                                {item.priority === 'high' ? '높음' : '보통'}
                              </span>
                            </div>
                            <div className="mt-3 pt-2 border-t border-gray-100">
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Clock className="w-3 h-3" />
                                <span>진행률: {progressPercentage}%</span>
                              </div>
                              <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5">
                                <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 디자인 요약 - 별도 섹션 */}
                      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-2 mb-3">
                          <FileText className="w-5 h-5 text-purple-600" />
                          <h5 className="font-semibold text-gray-900">디자인 요약</h5>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">검색 결과가 없습니다</h3>
              <p className="text-gray-600">다른 검색어로 시도해보세요.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}