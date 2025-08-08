import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar, User, Eye, ChevronDown, ChevronUp, FlaskConical, Search, Filter, Clock,
  FileText, CheckCircle, Hash, Building2, AlertCircle, Zap, Copy // Copy 아이콘 추가
} from 'lucide-react';
// import Header from '../components/Header';
import { patentDetailMockData } from '../mocks/patentDetailMock'; // 특허 목 데이터 임포트

// 특허 등록 단계를 위한 아이콘 (가정) - Lucide에 적합한 아이콘이 없다면 직접 정의하거나 다른 아이콘으로 대체
function PatentCertificate(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <path d="M14 2v6h6"></path>
      <path d="M9 13h6"></path>
      <path d="M9 17h6"></path>
      <path d="M12 9v-2"></path>
      <path d="M12 11v-2"></path>
    </svg>
  );
}

// 특허 진행 단계 정의
const patentStages = [
  { id: 'reception', name: '접수', icon: FileText, colorClass: { bg: 'bg-blue-600', border: 'border-blue-600', text: 'text-blue-700' } },
  { id: 'waiting', name: '심사대기', icon: Clock, colorClass: { bg: 'bg-purple-600', border: 'border-purple-600', text: 'text-purple-700' } },
  { id: 'examination', name: '심사중', icon: FlaskConical, colorClass: { bg: 'bg-yellow-600', border: 'border-yellow-600', text: 'text-yellow-700' } },
  { id: 'decision', name: '심결', icon: CheckCircle, colorClass: { bg: 'bg-teal-600', border: 'border-teal-600', text: 'text-teal-700' } },
  { id: 'registration', name: '등록', icon: PatentCertificate, colorClass: { bg: 'bg-green-600', border: 'border-green-600', text: 'text-green-700' } }
];

// 헬퍼 함수: 상태에 따른 색상 클래스 반환
const getStatusColorClass = (status) => {
  switch (status) {
    case '심사중':
      return 'bg-yellow-100 text-yellow-800';
    case '심사완료':
      return 'bg-green-100 text-green-700';
    case '심사대기':
      return 'bg-blue-100 text-blue-800';
    case '거절':
      return 'bg-red-100 text-red-700';
    case '등록결정':
      return 'bg-green-100 text-green-700'; // 등록결정도 완료로 간주
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function PatentDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCard, setExpandedCard] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('all');

  const navigate = useNavigate();

  // 목 데이터를 가공하여 상태 색상 및 우선순위 추가
  const processedPatentData = useMemo(() => {
    return Object.values(patentDetailMockData).map((item) => ({
      ...item,
      statusColor: getStatusColorClass(item.status),
      // 목 데이터에 priority가 없다면 랜덤으로 할당 (예시: 특정 ID에 대해 우선순위 'high' 부여)
      priority: item.id === 'P-2024-001' ? 'high' : (item.priority || 'medium'), 
      estimatedDays: item.estimatedDays || (Math.floor(Math.random() * 30) + 15), // 특허 심사는 디자인보다 길 수 있으므로 범위 조정
    }));
  }, [patentDetailMockData]);

  // 검색어 및 필터에 따라 데이터 필터링
  const filteredData = useMemo(() => {
    return processedPatentData.filter(item => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.applicant.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilter =
        selectedFilter === 'all' ||
        (selectedFilter === 'pending' && item.status === '심사중') ||
        (selectedFilter === 'approved' && item.status === '심사완료') ||
        (selectedFilter === 'waiting' && item.status === '심사대기') ||
        (selectedFilter === 'rejected' && item.status === '거절') ||
        (selectedFilter === 'granted' && item.status === '등록결정');

      return matchesSearch && matchesFilter;
    });
  }, [processedPatentData, searchTerm, selectedFilter]);

  const handleCardExpand = (id) => {
    setExpandedCard(expandedCard === id ? null : id);
  };

  const handleDetailView = (id) => {
    navigate(`/patentreview/${id}`); // 특허 상세 페이지 경로
  };

  // 통계 계산
  const totalPatents = processedPatentData.length;
  const pendingPatents = processedPatentData.filter(d => d.status === '심사중').length;
  const thisMonthReception = processedPatentData.filter(d => {
    const receptionDate = new Date(d.receptionDate);
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    return !isNaN(receptionDate.getTime()) && 
           receptionDate.getMonth() === currentMonth && 
           receptionDate.getFullYear() === currentYear;
  }).length;
  const averageReviewTime = '120일'; // 특허 평균 심사 기간 (가정)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-gray-50"> {/* 배경 색상 변경 */}
      

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 검색 및 필터 섹션 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="특허번호, 출원인, 특허명으로 검색..."
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" // 색상 변경
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-3">
              <select
                className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" // 색상 변경
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
              >
                <option value="all">전체 상태</option>
                <option value="waiting">심사대기</option>
                <option value="pending">심사중</option>
                <option value="approved">심사완료</option> {/* '등록' 대신 '심사완료'로 변경 (목 데이터에 맞춤) */}
                <option value="rejected">거절</option>
                <option value="granted">등록결정</option>
              </select>
              <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all flex items-center gap-2 font-medium border-0"> {/* 색상 변경 */}
                <Filter className="w-4 h-4" />
                필터 적용
              </button>
            </div>
          </div>
        </div>

        {/* 통계 카드 섹션 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">전체 출원</p>
                <p className="text-2xl font-bold text-gray-900">{totalPatents}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center"> {/* 색상 변경 */}
                <FlaskConical className="w-6 h-6 text-blue-600" /> {/* 아이콘 변경 */}
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

        {/* 특허 카드 목록 */}
        <div className="space-y-4">
          {filteredData.length > 0 ? (
            filteredData.map((item) => { // 'patent' 대신 'item'으로 일관성 유지
              // 현재 아이템의 상태를 기반으로 진행 단계 completed 및 current 상태 업데이트
              const updatedPatentStages = patentStages.map((stage, index) => {
                let stageCompleted = false;
                let stageCurrent = false;

                switch (stage.id) {
                  case 'reception':
                    stageCompleted = !!item.receptionDate;
                    stageCurrent = false; // 접수 완료 후에는 '현재' 단계 아님
                    break;
                  case 'waiting':
                    stageCompleted = ['심사중', '심사완료', '거절', '등록결정'].includes(item.status);
                    stageCurrent = item.status === '심사대기';
                    break;
                  case 'examination':
                    stageCompleted = ['심사완료', '거절', '등록결정'].includes(item.status);
                    stageCurrent = item.status === '심사중';
                    break;
                  case 'decision':
                    stageCompleted = ['등록결정'].includes(item.status); // 등록결정 시 완료
                    stageCurrent = ['심사완료', '거절', '등록결정'].includes(item.status); // 심사완료, 거절, 등록결정 시 깜빡임
                    break;
                  case 'registration':
                    stageCompleted = item.status === '등록결정'; // 등록결정 시 완료
                    stageCurrent = false; // 등록은 최종 완료이므로 '현재' 단계 아님
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

              // 진행률 계산
              const progressPercentage = item.reviewProgress || 0;

              return (
                <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all">
                  {/* 카드 헤더 */}
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
                            e.stopPropagation(); // 버튼 클릭 시 카드 확장 방지
                            handleDetailView(item.id);
                          }}
                          className="px-4 py-2 bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-lg hover:from-gray-500 hover:to-gray-600 transition-all flex items-center gap-2 text-sm font-medium border-0" // 색상 변경
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

                  {/* 확장된 내용 */}
                  {expandedCard === item.id && (
                    <div className="border-t border-gray-100 bg-gradient-to-r from-gray-50 to-blue-50 p-6"> {/* 배경 색상 변경 */}
                      {/* 진행 상황 타임라인 */}
                      <div className="mb-6">
                        <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <Clock className="w-5 h-5 text-blue-600" /> {/* 아이콘 색상 변경 */}
                          심사 진행 상황
                        </h4>
                        <div className="flex items-center justify-between bg-white rounded-lg p-4 shadow-sm">
                          {updatedPatentStages.map((stage, index) => (
                            <div key={stage.id} className="flex items-center">
                              <div className="flex flex-col items-center flex-shrink-0">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                                  stage.current
                                    ? `${stage.colorClass.bg} ${stage.colorClass.border} text-white animate-pulse`
                                    : stage.completed
                                      ? `${stage.colorClass.bg} ${stage.colorClass.border} text-white`
                                      : 'bg-gray-100 border-gray-300 text-gray-400'
                                }`}>
                                  <stage.icon className="w-5 h-5" width="20" height="20" />
                                </div>
                                <span className={`text-xs mt-2 font-medium text-center ${
                                  stage.current
                                    ? stage.colorClass.text
                                    : stage.completed
                                      ? stage.colorClass.text
                                      : 'text-gray-400'
                                }`}>
                                  {stage.name}
                                </span>
                              </div>
                              {index < updatedPatentStages.length - 1 && (
                                <div className={`flex-1 h-0.5 mx-4 ${
                                  updatedPatentStages[index + 1].completed || (stage.current && updatedPatentStages[index + 1].current) 
                                  ? 'bg-blue-300' // 파란색으로 변경 (진행 중인 연결선)
                                  : stage.completed ? 'bg-green-300' : 'bg-gray-200'
                                }`} />
                              )}
                            </div>
                          ))}
                        </div>
                        {/* 예상 완료 시간 */}
                        <div className="mt-3 text-center">
                          <span className="text-sm text-gray-600">
                            예상 심사 완료: <span className="font-semibold text-blue-600">{item.estimatedDays}일 후</span> {/* 색상 변경 */}
                          </span>
                        </div>
                      </div>

                      {/* 정보 카드들 */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        {/* 출원 정보 카드 */}
                        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                          <div className="flex items-center gap-2 mb-3">
                            <FileText className="w-5 h-5 text-blue-600" />
                            <h5 className="font-semibold text-gray-900">출원 정보</h5>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <Hash className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">출원번호:</span>
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
                                <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${progressPercentage}%` }}></div> {/* 색상 변경 */}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 발명 요약 - 별도 섹션 */}
                      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-2 mb-3">
                          <FileText className="w-5 h-5 text-purple-600" />
                          <h5 className="font-semibold text-gray-900">발명 요약</h5>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {item.description} {/* 'summary' 대신 'description' 사용 */}
                        </p>
                      </div>

                      {/* 청구항 목록 */}
                      {item.claims && item.claims.length > 0 && (
                        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 mt-4">
                          <div className="flex items-center gap-2 mb-3">
                            <FileText className="w-5 h-5 text-orange-600" />
                            <h5 className="font-semibold text-gray-900">청구항</h5>
                          </div>
                          <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                            {item.claims.map((claim, idx) => (
                              <li key={idx}>{claim}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                       {/* 유사 특허 검색 결과 */}
                      <div className="border border-gray-200 p-6 rounded-xl bg-white shadow-sm mt-4">
                        <h3 className="font-semibold text-xl mb-4 text-gray-800 flex items-center gap-2">
                          <Copy className="w-5 h-5 text-blue-500" /> {/* 아이콘 색상 변경 */}
                          유사 특허 검색 결과
                        </h3>
                        <div className="flex gap-4 overflow-x-auto pb-2 -mx-2 px-2">
                          {item.relatedPatents && item.relatedPatents.length > 0 ? (
                            item.relatedPatents.map((similar, index) => (
                              <div key={index} className="min-w-[200px] w-full max-w-[250px] border border-gray-200 rounded-lg overflow-hidden bg-gray-50 shadow-sm flex-shrink-0">
                                <img src={similar.image} alt={similar.title} className="w-full h-32 object-cover bg-gray-200" />
                                <div className="p-3">
                                  <p className="text-sm font-medium text-gray-800">특허번호: {similar.id}</p>
                                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">{similar.description}</p> {/* 'comment' 대신 'description' 사용 */}
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-gray-600">유사 특허 검색 결과가 없습니다.</p>
                          )}
                        </div>
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