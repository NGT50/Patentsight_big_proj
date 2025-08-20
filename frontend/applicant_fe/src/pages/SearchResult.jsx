import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { searchSimilarPatents } from '../api/search'; // 실제 API 함수
import { Search } from 'lucide-react';
import PatentCard from '../components/PatentCard';
import Button from '../components/Button';

const SearchResultPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  // 초기 대화 예시만 남겨둡니다.
  const [chatHistory, setChatHistory] = useState([
    { sender: 'bot', text: '찾고 싶은 특허 기술에 대해 질문해주세요.' }
  ]);

  const searchMutation = useMutation({
    mutationFn: searchSimilarPatents, // 실제 API 함수로 교체
    onSuccess: (data) => {
      // API 응답에서 챗봇 답변과 특허 목록을 분리합니다.
      const botAnswer = data.answer || "검색 결과입니다.";
      const patents = data.patents || [];
      
      setChatHistory(prev => [...prev, { sender: 'bot', text: botAnswer }]);
      // setQueryResults(patents); // 아래 searchMutation.data를 직접 사용
    },
    onError: (error) => {
      setChatHistory(prev => [...prev, { sender: 'bot', text: `오류가 발생했습니다: ${error.message}` }]);
    }
  });

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setChatHistory(prev => [...prev, { sender: 'user', text: searchQuery }]);
    searchMutation.mutate({ searchQuery });
    setSearchQuery('');
  };

  const handleCardClick = (patentId) => {
    navigate(`/patent/${patentId}`);
  };

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">대화형 유사 특허 검색</h1>

      {/* 챗봇 및 검색창 */}
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
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <Button type="submit" disabled={searchMutation.isPending} variant="primary" className="w-auto px-6">
            {searchMutation.isPending ? '검색 중...' : '검색'}
          </Button>
        </form>
      </div>

      {/* 검색 결과 목록 */}
      <div className="mt-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <h2 className="text-2xl font-bold text-gray-800">검색 결과</h2>
          {/* 필터/정렬 UI는 현재 기능과 무관하므로 그대로 둡니다. */}
        </div>
        <div className="mt-4 space-y-4">
          {searchMutation.isPending && <p className="text-center text-gray-600">유사 특허를 검색하고 있습니다...</p>}
          {searchMutation.isError && !searchMutation.isPending && <p className="text-center text-red-600">오류가 발생했습니다: {searchMutation.error.message}</p>}
          
          {searchMutation.data?.patents && searchMutation.data.patents.length === 0 && <p className="text-center text-gray-500">검색 결과가 없습니다.</p>}

          {searchMutation.data?.patents && searchMutation.data.patents.map((patent) => (
            <PatentCard key={patent.patentId} data={patent} onClick={() => handleCardClick(patent.patentId)} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchResultPage;