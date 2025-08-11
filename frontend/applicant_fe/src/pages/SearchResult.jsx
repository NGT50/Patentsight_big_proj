import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { searchSimilarPatents } from '../api/search';
import { FileText, Search, Filter, Calendar, User, Eye, AlertCircle } from 'lucide-react';

// 병합된 공용 컴포넌트를 사용합니다.
import PatentCard from '../components/PatentCard'; 
import Button from '../components/Button';

const SearchResultPage = () => {
  const navigate = useNavigate();

  // --- 기능 로직 (jw-front) ---
  const [searchQuery, setSearchQuery] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { sender: 'user', text: '3개의 날개로 회전하는 나사 구조는 등록 가능할까요?' },
    { sender: 'bot', text: '유사한 선행 특허가 다수 존재하므로, 단순한 구조 유사성만으로는 등록이 어렵습니다. 차별화 요소를 강조하여 청구항을 작성해보는 것이 좋습니다.' }
  ]);
  const [searchTarget, setSearchTarget] = useState('domestic');
  const [statusFilters, setStatusFilters] = useState({ all: true, registered: false, rejected: false });
  const [sortOrder, setSortOrder] = useState('default');

  const searchMutation = useMutation({
    mutationFn: searchSimilarPatents,
    onSuccess: (data) => {
      // 검색 성공 시, 챗봇 히스토리에 응답을 추가할 수 있습니다.
      // setChatHistory(prev => [...prev, { sender: 'bot', text: '유사 특허를 찾았습니다.' }]);
    },
    onError: (error) => {
      console.error("검색 실패:", error);
    }
  });

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setChatHistory(prev => [...prev, { sender: 'user', text: searchQuery }]);
    searchMutation.mutate({ searchQuery, searchTarget, statusFilters, sortOrder });
    setSearchQuery('');
  };

  const handleStatusFilterChange = (e) => {
    const { name, checked } = e.target;
    setStatusFilters(prev => ({ ...prev, [name]: checked }));
  };

  const handleCardClick = (patentId) => {
    navigate(`/patent/${patentId}`);
  };

  // --- UI 렌더링 (develop-fe2 디자인 기반 + jw-front 기능) ---
  return (
    <div className="max-w-screen-xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">대화형 유사 특허 검색</h1>

      {/* 챗봇 및 검색창 (develop-fe2 디자인 + jw-front 기능) */}
      <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="p-4 mb-6 border-b border-gray-200 min-h-[150px]">
          {chatHistory.map((chat, index) => (
            <div key={index} className={`p-3 my-2 rounded-lg w-fit max-w-[80%] ${
              chat.sender === 'user' 
              ? 'ml-auto bg-blue-500 text-white' 
              : 'mr-auto bg-gray-100 text-gray-800'
            }`}>
              <p>{chat.text}</p>
            </div>
          ))}
        </div>
        
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="궁금한 기술에 대해 질문하거나 키워드를 입력하세요..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>
          <Button
            type="submit"
            disabled={searchMutation.isPending}
            variant="primary"
            className="w-auto px-6"
          >
            {searchMutation.isPending ? '검색 중...' : '검색'}
          </Button>
        </form>
      </div>

      {/* 검색 결과 목록 (develop-fe2 디자인 + jw-front 기능) */}
      <div className="mt-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <h2 className="text-2xl font-bold text-gray-800">검색 결과</h2>
          <div className="flex items-center gap-6">
            <div className="flex bg-white border border-gray-300 rounded-md">
              <button onClick={() => setSearchTarget('domestic')} className={`px-3 py-1 text-sm rounded-l-md ${searchTarget === 'domestic' ? 'bg-blue-600 text-white' : 'hover:bg-gray-50'}`}>국내</button>
              <button onClick={() => setSearchTarget('overseas')} className={`px-3 py-1 text-sm rounded-r-md ${searchTarget === 'overseas' ? 'bg-blue-600 text-white' : 'hover:bg-gray-50'}`}>해외</button>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" name="all" checked={statusFilters.all} onChange={handleStatusFilterChange} className="rounded" /> 전체</label>
              <label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" name="registered" checked={statusFilters.registered} onChange={handleStatusFilterChange} className="rounded" /> 등록</label>
              <label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" name="rejected" checked={statusFilters.rejected} onChange={handleStatusFilterChange} className="rounded" /> 거절</label>
            </div>
            <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500">
              <option value="default">기본정렬</option>
              <option value="date">출원일자순</option>
              <option value="number">출원번호순</option>
            </select>
          </div>
        </div>
        <div className="mt-4 space-y-4">
          {searchMutation.isPending && <p className="text-center text-gray-600">유사 특허를 검색하고 있습니다...</p>}
          {searchMutation.isError && <p className="text-center text-red-600">오류가 발생했습니다: {searchMutation.error.message}</p>}
          {searchMutation.data && searchMutation.data.length === 0 && <p className="text-center text-gray-500">검색 결과가 없습니다.</p>}
          {searchMutation.data && searchMutation.data.map((patent) => (
            <PatentCard key={patent.patentId} data={patent} onClick={() => handleCardClick(patent.patentId)} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchResultPage;