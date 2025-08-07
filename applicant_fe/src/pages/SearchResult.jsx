import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
// searchSimilarPatents는 나중에 실제 API를 연결할 때 다시 사용할 것이므로 import는 그대로 둡니다.
import { searchSimilarPatents } from '../api/search';

import TopBar from '../components/TopBar';
import PatentCard from '../components/PatentCard';
import { useNavigate } from 'react-router-dom';

// ADDED: 테스트를 위한 가짜 검색 결과 데이터를 생성합니다.
const mockSearchResults = [
  {
    patentId: 201,
    title: '회전 나사 고정 장치',
    cpc: 'B05C1/00',
    inventor: '홍길동',
    status: '등록',
    applicationDate: '2025-08-10',
    summary: '본 특허는 나사의 자동 조임 구조가 유사합니다. 청구항 2, 3을 참고해보세요.'
  },
  {
    patentId: 202,
    title: '자동 토크 조절 나사 체결 장치',
    cpc: 'B25B23/005',
    inventor: '김지민',
    status: '거절',
    applicationDate: '2025-12-02',
    summary: '본 특허는 나사의 토크 조절 및 체결 방식이 유사합니다. 청구항 1, 4를 확인해보세요.'
  },
  {
    patentId: 203,
    title: '스마트폰 연동형 나사 구조 분석기',
    cpc: 'G01M1/00',
    inventor: '이영희',
    status: '공개',
    applicationDate: '2024-05-20',
    summary: '회전 날개 구조에 대한 선행 기술로 참고할 수 있습니다.'
  }
];


const SearchResultPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  // 1. 필터 및 정렬을 위한 state를 추가합니다.
  const [searchTarget, setSearchTarget] = useState('domestic'); // 'domestic' or 'overseas'
  const [statusFilters, setStatusFilters] = useState({
    all: true,
    registered: false,
    rejected: false,
  });

  const [sortOrder, setSortOrder] = useState('default'); // 'default', 'date', 'number'
  const searchMutation = useMutation({
    // CHANGED: mutationFn을 가짜 API 호출 함수로 임시 교체합니다.
    mutationFn: async ({ searchQuery }) => {
      console.log(`[MOCK] 유사 특허 검색 요청: ${searchQuery}`);
      // 1.5초의 딜레이를 주어 실제 API처럼 보이게 합니다.
      await new Promise(resolve => setTimeout(resolve, 1500));
      // 미리 만들어둔 가짜 데이터를 반환합니다.
      return mockSearchResults;
    },
    // onSuccess, onError 콜백은 필요에 따라 추가 가능
  });

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      alert('검색어를 입력해주세요.');
      return;
    }
    // 나중에는 여기에 필터, 정렬 state 값도 함께 담아서 API를 호출하게 됩니다.
    searchMutation.mutate({ searchQuery, searchTarget, statusFilters, sortOrder });
  };

  const handleStatusFilterChange = (e) => {
    const { name, checked } = e.target;
    setStatusFilters(prev => ({ ...prev, [name]: checked }));
  };

  const handleCardClick = (patentId) => {
    navigate(`/patent/${patentId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar />
      <main className="container p-6 mx-auto">
        <h1 className="mb-6 text-3xl font-bold text-gray-800">대화형 유사 특허 검색</h1>

        {/* 3. UI 레이아웃: 챗봇 UI와 검색 결과 UI로 구성 */}
        <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
          {/* 챗봇 대화 예시 UI */}
          <div className="p-4 mb-6 border-b border-gray-200">
            <div className="p-3 my-2 text-right text-white bg-blue-500 rounded-lg w-fit ml-auto">
              <p>3개의 날개로 회전하는 나사 구조는 등록 가능할까요?</p>
            </div>
            <div className="p-3 my-2 bg-gray-100 rounded-lg w-fit">
              <p>유사한 선행 특허가 다수 존재하므로, 단순한 구조 유사성만으로는 등록이 어렵습니다. 차별화 요소를 강조하여 청구항을 작성해보는 것이 좋습니다.</p>
            </div>
          </div>
          
          {/* 검색 입력창 */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="궁금한 기술에 대해 질문하거나 키워드를 입력하세요..."
              className="flex-grow px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={searchMutation.isPending}
              className="px-6 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
            >
              {searchMutation.isPending ? '검색 중...' : '검색'}
            </button>
          </form>
        </div>

        {/* 검색 결과 목록 */}
        <div className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">검색 결과</h2>
            {/* 2. 필터/정렬 UI를 추가합니다. */}
            <div className="flex items-center gap-6">
              {/* 국내/해외 탭 */}
              <div className="flex border border-gray-300 rounded-md">
                <button 
                  onClick={() => setSearchTarget('domestic')}
                  className={`px-3 py-1 text-sm ${searchTarget === 'domestic' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
                >
                  국내
                </button>
                <button 
                  onClick={() => setSearchTarget('overseas')}
                  className={`px-3 py-1 text-sm ${searchTarget === 'overseas' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
                >
                  해외
                </button>
              </div>
              {/* 상태 체크박스 */}
              <div className="flex items-center gap-4 text-sm">
                <label className="flex items-center gap-1"><input type="checkbox" name="all" checked={statusFilters.all} onChange={handleStatusFilterChange} /> 전체</label>
                <label className="flex items-center gap-1"><input type="checkbox" name="registered" checked={statusFilters.registered} onChange={handleStatusFilterChange} /> 등록</label>
                <label className="flex items-center gap-1"><input type="checkbox" name="rejected" checked={statusFilters.rejected} onChange={handleStatusFilterChange} /> 거절</label>
              </div>
              {/* 정렬 드롭다운 */}
              <select 
                value={sortOrder} 
                onChange={(e) => setSortOrder(e.target.value)}
                className="px-2 py-1 text-sm border border-gray-300 rounded-md"
              >
                <option value="default">기본정렬</option>
                <option value="date">출원일자순</option>
                <option value="number">출원번호순</option>
              </select>
            </div>
          </div>
          <div className="mt-4 space-y-4">
            {searchMutation.isPending && <p>유사 특허를 검색하고 있습니다...</p>}
            {searchMutation.isError && <p className="text-red-600">오류가 발생했습니다: {searchMutation.error.message}</p>}
            
            {searchMutation.data && searchMutation.data.length === 0 && <p>검색 결과가 없습니다.</p>}

            {searchMutation.data && searchMutation.data.map((patent) => (
              <PatentCard key={patent.patentId} data={patent} onClick={handleCardClick} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default SearchResultPage;