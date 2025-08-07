import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar, User, Eye, ChevronDown, ChevronUp, Palette, Search, Filter, Clock,
  FileText, CheckCircle, Hash, Building2, AlertCircle, Zap
} from 'lucide-react';
import Header from '../components/Header';
// import { designDetailMockData } from '../mocks/designDetailMock'; // ❌ 목 데이터는 더 이상 사용하지 않으므로 제거합니다.

// 특허 대시보드의 Certificate와 유사하게, 디자인 등록 단계를 위한 아이콘 (가정)
// Lucide에 적합한 아이콘이 없다면 직접 정의하거나 다른 아이콘으로 대체
function DesignCertificate(props) {
  return (
    // ✅ props를 SVG 엘리먼트에 직접 전달하여 유연성 확보
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
  { id: 'reception', name: '접수', icon: FileText, statusMatch: ['심사대기', '심사중', '심사완료', '보류'], colorClass: { bg: 'bg-blue-600', border: 'border-blue-600', text: 'text-blue-700' } },
  { id: 'waiting', name: '심사대기', icon: Clock, statusMatch: ['심사대기', '심사중', '심사완료', '보류'], colorClass: { bg: 'bg-purple-600', border: 'border-purple-600', text: 'text-purple-700' } },
  { id: 'examination', name: '심사중', icon: Search, statusMatch: ['심사중', '심사완료', '보류'], colorClass: { bg: 'bg-yellow-600', border: 'border-yellow-600', text: 'text-yellow-700' } },
  { id: 'decision', name: '심결', icon: CheckCircle, statusMatch: ['심사완료', '보류'], colorClass: { bg: 'bg-teal-600', border: 'border-teal-600', text: 'text-teal-700' } },
  { id: 'registration', name: '등록', icon: DesignCertificate, statusMatch: ['심사완료'], colorClass: { bg: 'bg-green-600', border: 'border-green-600', text: 'text-green-700' } }
];

export default function DesignDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCard, setExpandedCard] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('all');

  // 🚀 API 데이터를 위한 새로운 상태들
  const [designData, setDesignData] = useState([]); // 심사 목록 데이터
  const [dashboardSummary, setDashboardSummary] = useState({}); // 대시보드 요약 데이터
  const [loading, setLoading] = useState(true); // 로딩 상태
  const [error, setError] = useState(null); // 에러 상태

  const navigate = useNavigate();

  // 🚨 현재 로그인한 사용자의 ID. 실제 애플리케이션에서는 인증 시스템에서 가져와야 합니다.
  const loggedInUser = JSON.parse(localStorage.getItem('user'));
  const currentUserId = loggedInUser ? loggedInUser.id : null;
  const currentUserRole = loggedInUser ? loggedInUser.role : null;

  // 필터링 상태(영어)를 백엔드에서 사용하는 한글 상태로 변환하는 함수
  const getStatusText = (filter) => {
    switch(filter) {
      case 'waiting': return '심사대기';
      case 'pending': return '심사중';
      case 'approved': return '심사완료';
      case 'onhold': return '보류';
      default: return ''; // 'all'일 경우 빈 문자열 반환
    }
  };

  // 🚀 백엔드 API 호출 함수
  const fetchDashboardData = async () => {
    setLoading(true); // 데이터 로딩 시작
    setError(null); // 이전 에러 초기화

    try {
      // 1. 대시보드 요약 정보 API 호출
      // ✅ reviewType=DESIGN 쿼리 파라미터 추가
      const summaryResponse = await fetch(`http://localhost:8080/api/reviews/dashboard/${currentUserId}?reviewType=DESIGN`);
      if (!summaryResponse.ok) {
        throw new Error(`대시보드 요약 정보를 불러오는 데 실패했습니다: ${summaryResponse.status}`);
      }
      const summaryData = await summaryResponse.json();
      setDashboardSummary(summaryData);

      // 2. 심사 목록 API 호출 (필터링 적용)
      const listUrl = new URL(`http://localhost:8080/api/reviews/list/${currentUserId}`);
      const statusParam = getStatusText(selectedFilter);
      if (statusParam) {
          listUrl.searchParams.append('status', statusParam);
      }
      // ✅ reviewType=DESIGN 쿼리 파라미터 추가
      listUrl.searchParams.append('reviewType', 'DESIGN'); 

      const listResponse = await fetch(listUrl);
      if (!listResponse.ok) {
        throw new Error(`심사 목록을 불러오는 데 실패했습니다: ${listResponse.status}`);
      }
      const listData = await listResponse.json();

      // 🚀 백엔드 응답 데이터 구조에 맞춰 프론트엔드에서 사용할 데이터로 가공
      // 백엔드 ReviewListResponse 필드: reviewId, title, applicant, status, receptionDate, field, reviewProgress, examiner, description, applicationNumber
      const processedData = listData.map(item => ({
        id: item.reviewId, // 백엔드의 reviewId를 프론트엔드의 id로 매핑
        title: item.patentTitle, 
        applicant: item.applicantName, 
        status: item.status,
        receptionDate: item.receptionDate, 
        field: item.field,
        examiner: item.examinerName, 
        description: item.description,
        reviewProgress: item.reviewProgress, 
        applicationNumber: item.applicationNumber, // ✅ applicationNumber 매핑
        // statusColor는 프론트엔드에서 상태에 따라 동적으로 생성
        statusColor: item.status === 'REVIEWING' 
          ? 'bg-yellow-100 text-yellow-800'
          : item.status === 'APPROVED' 
            ? 'bg-green-100 text-green-700'
            : item.status === 'PENDING' 
              ? 'bg-blue-100 text-blue-800'
              : item.status === 'REJECTED' 
                ? 'bg-red-100 text-red-700'
                : 'bg-gray-100 text-gray-800',
        priority: item.id === 'D-2025-00002' ? 'high' : 'medium', 
        estimatedDays: Math.floor(Math.random() * 20) + 7, 
      }));

      setDesignData(processedData);

    } catch (err) {
      setError(err.message);
      console.error("API 호출 중 오류 발생:", err);
    } finally {
      setLoading(false); // 데이터 로딩 완료 (성공/실패 무관)
    }
  };

  // 🚀 컴포넌트가 처음 렌더링되거나 currentUserId, selectedFilter가 변경될 때마다 API 호출
  useEffect(() => {
    console.log('Current User ID:', currentUserId, 'Current User Role:', currentUserRole); 
    if (currentUserId && currentUserRole === 'design') {
      fetchDashboardData();
    } else if (!currentUserId) {
      setError("로그인이 필요합니다.");
      setLoading(false);
    } else {
      setError("디자인 심사관만 접근할 수 있습니다.");
      setDesignData([]);
      setDashboardSummary({});
      setLoading(false);
    }
  }, [currentUserId, currentUserRole, selectedFilter]);


  // 검색어와 필터링은 이제 API에서 가져온 designData를 기반으로 합니다.
  const filteredData = designData.filter(item => {
    // ✅ item.id (reviewId), item.title (patentTitle), item.applicant (applicantName), item.applicationNumber로 검색
    const matchesSearch =
      (item.title && item.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.applicant && item.applicant.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.id && String(item.id).toLowerCase().includes(searchTerm.toLowerCase())) || // reviewId
      (item.applicationNumber && item.applicationNumber.toLowerCase().includes(searchTerm.toLowerCase())); // ✅ applicationNumber 검색 추가
    
    return matchesSearch;
  });

  const handleCardExpand = (id) => {
    setExpandedCard(expandedCard === id ? null : id);
  };

  const handleDetailView = (id) => {
    navigate(`/designreview/${id}`);
  };

  // 🚀 통계 계산: dashboardSummary 상태 사용
  const totalDesigns = dashboardSummary.totalReviews || 0;
  const pendingDesigns = dashboardSummary.pendingReviews || 0;
  const thisMonthReception = dashboardSummary.thisMonthReceptions || 0; 
  
  // '7일 이상 심사대기'는 백엔드에서 직접 계산하여 제공하는 것이 가장 좋지만,
  // 백엔드에 해당 필드가 없다면 프론트에서 designData를 기반으로 계산합니다.
  const sevenDaysOverWaiting = designData.filter(d => {
    const receptionDate = new Date(d.receptionDate);
    if (isNaN(receptionDate.getTime())) { 
      return false;
    }
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - receptionDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return (d.status === 'PENDING' || d.status === 'REVIEWING') && diffDays >= 7; 
  }).length;


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-pink-50 to-indigo-50">
      <Header />

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
              <button className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all flex items-center gap-2 font-medium">
                <Filter className="w-4 h-4" />
                필터 적용
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {loading ? (
          <div className="text-center py-10 text-gray-500">대시보드 요약 정보를 불러오는 중...</div>
        ) : error ? (
          <div className="text-center py-10 text-red-500">오류: {error}</div>
        ) : (
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
                  <p className="text-sm text-gray-600 mb-1">7일 이상 심사대기</p>
                  <p className="text-2xl font-bold text-red-600">{sevenDaysOverWaiting}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                  {/* 경고를 나타내는 아이콘으로 변경 */}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Design Cards */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-10 text-gray-500">디자인 목록을 불러오는 중...</div>
          ) : error ? (
            <div className="text-center py-10 text-red-500">오류: {error}</div>
          ) : filteredData.length > 0 ? (
            filteredData.map((item) => {
              // 현재 아이템의 상태를 기반으로 진행 단계 completed 및 current 상태 업데이트
              const updatedDesignStages = designStages.map(stage => {
                let stageCompleted = false;
                let stageCurrent = false;

                switch (stage.id) {
                  case 'reception':
                    stageCompleted = !!item.receptionDate;
                    stageCurrent = false;
                    break;
                  case 'waiting':
                    // ✅ 백엔드 상태값 'PENDING'에 맞춰 수정
                    stageCompleted = ['REVIEWING', 'APPROVED', 'REJECTED'].includes(item.status);
                    stageCurrent = item.status === 'PENDING';
                    break;
                  case 'examination':
                    // ✅ 백엔드 상태값 'APPROVED', 'REJECTED'에 맞춰 수정
                    stageCompleted = ['APPROVED', 'REJECTED'].includes(item.status);
                    stageCurrent = item.status === 'REVIEWING';
                    break;
                  case 'decision':
                    // ✅ 백엔드 상태값 'APPROVED', 'REJECTED'에 맞춰 수정
                    stageCompleted = ['APPROVED', 'REJECTED'].includes(item.status);
                    stageCurrent = item.status === 'APPROVED' || item.status === 'REJECTED'; // 심결은 완료 또는 거절
                    break;
                  case 'registration':
                    // ✅ 백엔드 상태값 'APPROVED'에 맞춰 수정
                    stageCompleted = item.status === 'APPROVED';
                    stageCurrent = false; // 등록은 별도 단계로 간주
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

              // 진행률 계산 (백엔드 데이터의 reviewProgress 사용)
              const progressPercentage = item.reviewProgress || 0;

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
                            {item.applicationNumber}
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
                          className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all flex items-center gap-2 text-sm font-medium"
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
                              <FileText className="w-4 h-4 text-gray-400" /> {/* ✅ 아이콘 변경 */}
                              <span className="text-gray-600">출원번호:</span> {/* ✅ 텍스트 변경 */}
                              <span className="font-medium ml-auto">{item.applicationNumber}</span> {/* ✅ 출원번호 표시 */}
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
                              <span className="ml-6 font-medium ml-auto text-gray-900">{item.applicant}</span>
                            </div>
                             {/* ✅ 출원인 이름 표시 */}
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
