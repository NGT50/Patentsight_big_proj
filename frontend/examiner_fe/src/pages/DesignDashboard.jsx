// src/pages/DesignDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar, User, Eye, ChevronDown, ChevronUp, Palette, Search, Filter, Clock,
  FileText, CheckCircle, Hash, Building2, AlertCircle, Hourglass
} from 'lucide-react';
import { getReviewList, searchReviews, getReviewDetail } from '../api/review';

// 커스텀 아이콘 (디자인 등록)
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

// 진행 단계
const designStages = [
  { id: 'reception',    name: '접수',     icon: FileText,         colorClass: { bg: 'bg-blue-600',   border: 'border-blue-600',   text: 'text-blue-700'   } },
  { id: 'waiting',      name: '심사대기', icon: Clock,            colorClass: { bg: 'bg-purple-600', border: 'border-purple-600', text: 'text-purple-700' } },
  { id: 'examination',  name: '심사중',   icon: Search,           colorClass: { bg: 'bg-yellow-600', border: 'border-yellow-600', text: 'text-yellow-700' } },
  { id: 'decision',     name: '심결',     icon: CheckCircle,      colorClass: { bg: 'bg-teal-600',   border: 'border-teal-600',   text: 'text-teal-700'   } },
  { id: 'registration', name: '등록',     icon: DesignCertificate, colorClass: { bg: 'bg-green-600', border: 'border-green-600',  text: 'text-green-700'  } },
];

// 상태 라벨/색 (APPROVE/REJECT ↔ APPROVED/REJECTED 모두 수용)
const statusMap = {
  DRAFT:     { label: '임시저장',  color: 'bg-gray-100 text-gray-700' },
  SUBMITTED: { label: '심사대기',  color: 'bg-blue-100 text-blue-800' },
  REVIEWING: { label: '심사중',    color: 'bg-yellow-100 text-yellow-800' },
  APPROVED:  { label: '심사완료',  color: 'bg-green-100 text-green-700' },
  REJECTED:  { label: '거절',      color: 'bg-red-100 text-red-700' },
  APPROVE:   { label: '심사완료',  color: 'bg-green-100 text-green-700' }, // 과거 응답 호환
  REJECT:    { label: '거절',      color: 'bg-red-100 text-red-700' },
};

// 토큰에서 userId 보정
function decodeJwt(token) {
  try { return JSON.parse(atob(token.split('.')[1])); } catch { return null; }
}
function getUserIdFromAuthStrict() {
  const token = localStorage.getItem('token');
  const payload = token ? decodeJwt(token) : null;
  const tokenUserId = Number(payload?.userId ?? payload?.id ?? payload?.uid ?? payload?.user_id);
  const storageUserId = Number(localStorage.getItem('userId'));
  if (Number.isFinite(tokenUserId) && tokenUserId > 0) {
    if (!Number.isFinite(storageUserId) || storageUserId !== tokenUserId) {
      localStorage.setItem('userId', String(tokenUserId));
    }
    return tokenUserId;
  }
  if (Number.isFinite(storageUserId) && storageUserId > 0) return storageUserId;
  return null;
}

// 리스트 상태 문자열 정규화 (APPROVE→APPROVED, REJECT→REJECTED)
function normalizeStatus(s) {
  if (s === 'APPROVE') return 'APPROVED';
  if (s === 'REJECT')  return 'REJECTED';
  return s;
}

export default function DesignDashboard() {
  const [designData, setDesignData] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({ totalDesigns: 0, inReview: 0, pending: 0, completed: 0, onhold: 0 });
  const [overdueApplications, setOverdueApplications] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCard, setExpandedCard] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('all');

  // 상세 Lazy-load 저장소
  const [detailsById, setDetailsById] = useState({});
  const [loadingDetail, setLoadingDetail] = useState({}); // { [reviewId]: boolean }

  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      const userId = getUserIdFromAuthStrict();
      if (!userId) {
        setError(new Error('로그인이 필요합니다.'));
        setLoading(false);
        return;
      }
      try {
        setLoading(true);

        // 1차: list
        let listResponse;
        try {
          listResponse = await getReviewList(userId);
        } catch (err) {
          if (err?.response?.status === 403) {
            // 심사관 권한 경로 문제 시 search로 폴백
            listResponse = await searchReviews(userId, {});
          } else {
            throw err;
          }
        }

        // 통계
        setDashboardStats({
          totalDesigns: listResponse.length,
          pending:   listResponse.filter(i => normalizeStatus(i.status) === 'SUBMITTED').length,
          inReview:  listResponse.filter(i => normalizeStatus(i.status) === 'REVIEWING').length,
          completed: listResponse.filter(i => normalizeStatus(i.status) === 'APPROVED').length,
          onhold:    listResponse.filter(i => normalizeStatus(i.status) === 'REJECTED').length,
        });

        // 7일 이상 대기/진행 중 (submittedAt 기준)
        const today = new Date();
        const overdueCount = listResponse.filter((i) => {
          const d = i.submittedAt ? new Date(i.submittedAt) : null;
          if (!d) return false;
          const days = (today.getTime() - d.getTime()) / (1000 * 3600 * 24);
          const s = normalizeStatus(i.status);
          return (s === 'SUBMITTED' || s === 'REVIEWING') && days >= 7;
        }).length;
        setOverdueApplications(overdueCount);

        // 카드 데이터 (아코디언 열기 전에도 출원인/접수일 보이도록 매핑)
        const mapped = listResponse.map((i) => {
          const ns = normalizeStatus(i.status);
          const s = statusMap[ns] || { label: '알 수 없음', color: 'bg-gray-100 text-gray-800' };
          return {
            id: i.reviewId,
            title: i.patentTitle,
            applicant: i.applicantName || '-',          // 출원인: 리스트에서 바로
            examiner: i.examinerName || '-',
            status: ns,                                  // 정규화된 상태
            statusLabel: s.label,
            statusColor: s.color,
            receptionDate: i.submittedAt || '-',         // 접수일: 리스트에서 바로
            // 상세에서 채울 값들(펼칠 때 로드)
            field: null,
            description: null,
            reviewProgress: i.reviewProgress || 0,
            estimatedDays: i.estimatedDays || 0,
            priority: i.priority || 'medium',
          };
        });
        setDesignData(mapped);
      } catch (err) {
        setError(err);
        console.error('Failed to fetch dashboard data:', err?.response?.status, err?.response?.data || err?.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  // 아코디언 토글 + 상세 Lazy-load
  const handleCardExpand = async (id) => {
    setExpandedCard(expandedCard === id ? null : id);
    if (!detailsById[id]) {
      try {
        setLoadingDetail(prev => ({ ...prev, [id]: true }));
        const detail = await getReviewDetail(id);
        setDetailsById(prev => ({ ...prev, [id]: detail }));
      } catch (e) {
        console.error('detail load failed', e);
      } finally {
        setLoadingDetail(prev => ({ ...prev, [id]: false }));
      }
    }
  };

  // 필터링
  const filteredData = designData.filter((item) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      (item?.title || '').toLowerCase().includes(q) ||
      (item?.applicant || '').toLowerCase().includes(q) ||
      (item.id && String(item.id).toLowerCase().includes(q));

    const s = item.status;
    const matchesFilter =
      selectedFilter === 'all' ||
      (selectedFilter === 'waiting'   && s === 'SUBMITTED') ||
      (selectedFilter === 'reviewing' && s === 'REVIEWING') ||
      (selectedFilter === 'approved'  && s === 'APPROVED') ||
      (selectedFilter === 'onhold'    && s === 'REJECTED');

    return matchesSearch && matchesFilter;
  });

  const handleDetailView = (id) => navigate(`/designreview/${id}`);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
        <span className="ml-4 text-gray-600">데이터를 불러오는 중입니다...</span>
      </div>
    );
  }
  if (error) {
    const is403 = error?.response?.status === 403;
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-sm border border-red-200">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-red-700">오류가 발생했습니다.</h3>
          <p className="mt-2 text-gray-600">
            {is403 ? '권한이 없습니다. (요청한 userId와 로그인 토큰의 userId가 다를 수 있어요)'
                   : '데이터를 가져오는 데 실패했습니다. 잠시 후 다시 시도해주세요.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search / Filter */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="디자인번호(리뷰ID), 출원인, 디자인명으로 검색..."
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
                <option value="reviewing">심사중</option>
                <option value="approved">심사완료</option>
                <option value="onhold">거절</option>
              </select>
              <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all flex items-center gap-2 font-medium border-0">
                <Filter className="w-4 h-4" />
                필터 적용
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">전체 디자인</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalDesigns}</p>
              </div>
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Palette className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">심사대기</p>
                <p className="text-2xl font-bold text-blue-600">{dashboardStats.pending}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Hourglass className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">심사중</p>
                <p className="text-2xl font-bold text-yellow-600">{dashboardStats.inReview}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">심사완료</p>
                <p className="text-2xl font-bold text-green-600">{dashboardStats.completed}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* List */}
        <div className="space-y-4">
          {filteredData.length > 0 ? (
            filteredData.map((item) => {
              const getStageStatus = (stageId) => {
                switch (stageId) {
                  case 'reception':    return { completed: true, current: false };
                  case 'waiting':      return { completed: ['REVIEWING','APPROVED','REJECTED'].includes(item.status), current: item.status === 'SUBMITTED' };
                  case 'examination':  return { completed: ['APPROVED','REJECTED'].includes(item.status), current: item.status === 'REVIEWING' };
                  case 'decision':     return { completed: ['APPROVED'].includes(item.status), current: ['APPROVED','REJECTED'].includes(item.status) };
                  case 'registration': return { completed: ['APPROVED'].includes(item.status), current: ['APPROVED'].includes(item.status) };
                  default:             return { completed: false, current: false };
                }
              };
              const progressPercentage = item.reviewProgress || 0;
              const detail = detailsById[item.id];

              return (
                <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all">
                  <div className="p-6 cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => handleCardExpand(item.id)}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-sm font-mono text-gray-600 bg-gray-100 px-3 py-1 rounded-full">{item.id}</span>
                          <span className={`text-xs px-3 py-1 rounded-full font-medium ${item.statusColor}`}>{item.statusLabel}</span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{item.title}</h3>
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
                          onClick={(e) => { e.stopPropagation(); handleDetailView(item.id); }}
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

                  {expandedCard === item.id && (
                    <div className="border-t border-gray-100 bg-gradient-to-r from-gray-50 to-indigo-50 p-6">
                      {/* 진행상황 */}
                      <div className="mb-6">
                        <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <Clock className="w-5 h-5 text-indigo-600" /> 심사 진행 상황
                        </h4>
                        <div className="flex items-center justify-between bg-white rounded-lg p-4 shadow-sm">
                          {designStages.map((stage, index) => {
                            const { completed, current } = getStageStatus(stage.id);
                            return (
                              <div key={stage.id} className="flex items-center">
                                <div className="flex flex-col items-center flex-shrink-0">
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                                    current ? `${stage.colorClass.bg} ${stage.colorClass.border} text-white animate-pulse` :
                                    completed ? `${stage.colorClass.bg} ${stage.colorClass.border} text-white` :
                                    'bg-gray-100 border-gray-300 text-gray-400'
                                  }`}>
                                    <stage.icon className="w-5 h-5" />
                                  </div>
                                  <span className={`text-xs mt-2 font-medium text-center ${current || completed ? stage.colorClass.text : 'text-gray-400'}`}>{stage.name}</span>
                                </div>
                                {index < designStages.length - 1 && (
                                  <div className={`flex-1 h-0.5 mx-4 ${completed ? 'bg-green-300' : 'bg-gray-200'}`} />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* 3열: 디자인/당사자/상태 */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        {/* 디자인 정보 */}
                        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                          <div className="flex items-center gap-2 mb-3">
                            <Palette className="w-5 h-5 text-indigo-600" />
                            <h5 className="font-semibold text-gray-900">디자인 정보</h5>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <Hash className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">디자인번호:</span>
                              <span className="font-medium ml-auto">{detailsById[item.id]?.applicationNumber ?? item.id}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">접수일:</span>
                              <span className="font-medium ml-auto">{detailsById[item.id]?.applicationDate ?? item.receptionDate}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">분류:</span>
                              <span className="font-medium ml-auto">{detailsById[item.id]?.technicalField ?? '-'}</span>
                            </div>
                          </div>
                        </div>

                        {/* 당사자 정보 */}
                        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                          <div className="flex items-center gap-2 mb-3">
                            <User className="w-5 h-5 text-green-600" />
                            <h5 className="font-semibold text-gray-900">당사자 정보</h5>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">출원인:</span>
                              <span className="ml-6 font-medium ml-auto text-gray-900">{detailsById[item.id]?.applicantName ?? item.applicant}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-3">
                              <User className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">담당 심사관:</span>
                              <span className="font-medium ml-auto">{detailsById[item.id]?.examinerName ?? item.examiner}</span>
                            </div>
                          </div>
                        </div>

                        {/* 현재 상태 */}
                        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                          <div className="flex items-center gap-2 mb-3">
                            <AlertCircle className="w-5 h-5 text-yellow-600" />
                            <h5 className="font-semibold text-gray-900">현재 상태</h5>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600">심사상태:</span>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${item.statusColor}`}>{item.statusLabel}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600">우선순위:</span>
                              <span className="font-medium">{item.priority === 'high' ? '높음' : '보통'}</span>
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

                      {/* 요약 */}
                      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-2 mb-3">
                          <FileText className="w-5 h-5 text-purple-600" />
                          <h5 className="font-semibold text-gray-900">디자인 요약</h5>
                        </div>
                        {loadingDetail[item.id] ? (
                          <div className="animate-pulse h-4 bg-gray-200 rounded w-1/2" />
                        ) : (
                          <p className="text-sm text-gray-700 leading-relaxed">
                            {detailsById[item.id]?.summary ?? '디자인에 대한 구체적인 요약 정보가 없습니다.'}
                          </p>
                        )}
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
