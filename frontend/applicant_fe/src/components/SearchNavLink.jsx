import React from 'react';
import { useNavigate } from 'react-router-dom';

const SearchNavLink = () => {
  const navigate = useNavigate();

  const goToSearch = () => {
    navigate('/search');
  };

  return (
    <div
      onClick={goToSearch}
      className="flex items-center justify-between w-full p-6 mb-8 bg-white border border-gray-200 rounded-lg shadow-sm cursor-pointer hover:border-blue-500 hover:shadow-md transition-all"
    >
      <h2 className="text-2xl font-bold text-gray-700">대화형 유사 특허 검색</h2>
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="w-8 h-8 text-gray-400" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
        />
      </svg>
    </div>
  );
};

export default SearchNavLink;