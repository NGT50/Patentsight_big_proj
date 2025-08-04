import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar, User, Eye, ChevronDown, ChevronUp, Palette, Search, Filter, Clock
} from 'lucide-react'; // Import Search, Filter, Clock for consistency
import Header from '../components/Header';
import { designDetailMockData } from '../mocks/designDetailMock';

const designData = Object.values(designDetailMockData).map((item) => ({
  ...item,
  // Assign statusColor based on actual status from mock data
  statusColor: item.status === '심사중'
    ? 'bg-yellow-100 text-yellow-800'
    : item.status === '심사완료'
    ? 'bg-green-100 text-green-700'
    : item.status === '심사대기'
    ? 'bg-blue-100 text-blue-800' // Added color for '심사대기'
    : 'bg-red-100 text-red-700', // For '보류' or other statuses
  priority: item.id === 'D-2025-00002' ? 'high' : 'medium', // Example: AI 스피커를 우선심사로
}));

export default function DesignDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCard, setExpandedCard] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('all'); // State for filter

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
      (selectedFilter === 'waiting' && item.status === '심사대기') || // New filter option
      (selectedFilter === 'onhold' && item.status === '보류'); // New filter option

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
    const receptionMonth = new Date(d.receptionDate).getMonth();
    const currentMonth = new Date().getMonth();
    const receptionYear = new Date(d.receptionDate).getFullYear();
    const currentYear = new Date().getFullYear();
    // Assuming 'this month' means current month of current year
    return receptionMonth === currentMonth && receptionYear === currentYear;
  }).length;
  // Placeholder for average review time, as it's not in mock data
  const averageReviewTime = '22.5일';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-pink-50 to-indigo-50"> {/* Adjusted gradient for design theme */}
      <Header />

      {/* Main Content */}
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
                <option value="onhold">보류</option> {/* Added '보류' filter */}
              </select>
              <button className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all flex items-center gap-2 font-medium">
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
                <User className="w-6 h-6 text-purple-600" /> {/* Using User icon for general average */}
              </div>
            </div>
          </div>
        </div>

        {/* Design Cards */}
        <div className="space-y-4">
          {filteredData.map((item) => (
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
                      {item.priority === 'high' && (
                        <span className="text-xs px-3 py-1 bg-red-100 text-red-700 rounded-full font-medium">
                          우선심사
                        </span>
                      )}
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

              {/* Expanded Content */}
              {expandedCard === item.id && (
                <div className="border-t border-gray-100 bg-gradient-to-r from-gray-50 to-indigo-50 p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">디자인 정보</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">디자인번호:</span>
                          <span className="font-medium">{item.id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">출원인:</span>
                          <span className="font-medium">{item.applicant}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">접수일자:</span>
                          <span className="font-medium">{item.receptionDate}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">심사상태:</span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${item.statusColor}`}>
                            {item.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">디자인 요약</h4>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {item.description} {/* Use item.description from designDetailMock */}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredData.length === 0 && (
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
  );
}