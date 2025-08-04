import { useState } from 'react';
import {
  Search, Filter, Calendar, User, FileText,
  Clock, ChevronDown, ChevronUp, Eye
} from 'lucide-react';
import { patentDetailMockData } from '../mocks/patentDetailMock';
import Header from '../components/Header';
import { useNavigate } from 'react-router-dom';

const patentData = Object.values(patentDetailMockData).map((item) => ({
  ...item,
  status: '심사중',
  statusColor: 'bg-yellow-100 text-yellow-800',
  priority: 'medium'
}));

export default function PatentDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCard, setExpandedCard] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const navigate = useNavigate();

  const filteredData = patentData.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.applicant.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 선택된 필터에 따라 데이터를 추가 필터링
  const finalFilteredData = filteredData.filter(item => {
    if (selectedFilter === 'all') return true;
    // 실제 데이터의 status 값과 selectedFilter 값을 맞춰야 합니다.
    // 현재 mock data에는 '심사중'만 있으므로, 예시 로직입니다.
    if (selectedFilter === 'pending' && item.status === '심사중') return true;
    if (selectedFilter === 'approved' && item.status === '등록') return true; // mock data에 없음
    if (selectedFilter === 'rejected' && item.status === '거절') return true; // mock data에 없음
    return false;
  });

  const handleCardExpand = (id) => {
    setExpandedCard(expandedCard === id ? null : id);
  };

  const handleDetailView = (id) => {
    navigate(`/patentreview/${id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Header />

      {/* Main Content - 좌우 여백을 줄여 전체 너비 활용 */}
      {/* max-w-7xl mx-auto 를 제거하고 px-8로 좌우 패딩을 줍니다. */}
      <div className="px-8 py-8"> {/* <-- 이 부분을 수정했습니다. */}
        {/* Search and Filter Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="출원번호, 출원인, 발명제목으로 검색..."
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-3">
              <select
                className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
              >
                <option value="all">전체 상태</option>
                <option value="pending">심사중</option>
                <option value="approved">등록</option>
                <option value="rejected">거절</option>
              </select>
              {/* 필터 적용 버튼은 실제 필터링 로직이 select onChange에서 바로 적용되므로, 필요하면 추가 액션을 넣을 수 있습니다. */}
              <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all flex items-center gap-2 font-medium">
                <Filter className="w-4 h-4" />
                필터 적용
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"> {/* 그리드 컬럼 반응형 조절 */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">전체 출원</p>
                <p className="text-2xl font-bold text-gray-900">{patentData.length}</p>
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
                <p className="text-2xl font-bold text-yellow-600">{patentData.filter(p => p.status === '심사중').length}</p>
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
                {/* 현재 날짜 기준으로 이번 달 접수된 특허를 계산 (mock data에서는 고정값) */}
                <p className="text-2xl font-bold text-green-600">
                  {patentData.filter(p => {
                      const receptionDate = new Date(p.receptionDate);
                      const currentMonth = new Date().getMonth();
                      const currentYear = new Date().getFullYear();
                      return receptionDate.getMonth() === currentMonth && receptionDate.getFullYear() === currentYear;
                  }).length}
                </p>
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
                <p className="text-2xl font-bold text-purple-600">18.2일</p> {/* 이 값은 mock data에 없으므로 고정 */}
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <User className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Patent Cards */}
        <div className="space-y-4">
          {finalFilteredData.length > 0 ? (
            finalFilteredData.map((patent) => (
              <div key={patent.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all">
                {/* Card Header */}
                <div
                  className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => handleCardExpand(patent.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-sm font-mono text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                          {patent.id}
                        </span>
                        <span className={`text-xs px-3 py-1 rounded-full font-medium ${patent.statusColor}`}>
                          {patent.status}
                        </span>
                        {patent.priority === 'high' && (
                          <span className="text-xs px-3 py-1 bg-red-100 text-red-700 rounded-full font-medium">
                            우선심사
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                        {patent.title}
                      </h3>
                      <div className="flex items-center gap-6 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span>{patent.applicant}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{patent.receptionDate}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // 카드 확장 이벤트 방지
                          handleDetailView(patent.id);
                        }}
                        // 상세보기 버튼 색상을 DesignReview와 통일 (녹색 계열)
                        className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all flex items-center gap-2 text-sm font-medium"
                      >
                        <Eye className="w-4 h-4" />
                        상세보기
                      </button>
                      {expandedCard === patent.id ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                {expandedCard === patent.id && (
                  <div className="border-t border-gray-100 bg-gradient-to-r from-gray-50 to-blue-50 p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">출원 정보</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">출원번호:</span>
                            <span className="font-medium">{patent.id}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">출원인:</span>
                            <span className="font-medium">{patent.applicant}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">접수일자:</span>
                            <span className="font-medium">{patent.receptionDate}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">심사상태:</span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${patent.statusColor}`}>
                              {patent.status}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">발명 요약</h4>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {patent.summary}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
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