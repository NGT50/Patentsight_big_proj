import React from 'react';

// 이제 별도의 CSS 파일이 필요 없습니다.
// import './FeatureButton.css'; 

const FeatureButton = ({ title, sub, onClick }) => {
  return (
    // Tailwind CSS 유틸리티 클래스로 스타일을 직접 적용합니다.
    <div 
      className="flex flex-col items-center justify-center p-4 bg-white border border-gray-300 rounded-lg shadow-sm cursor-pointer hover:bg-gray-50 hover:shadow-md transition-all"
      onClick={onClick}
    >
      <div className="font-semibold text-gray-800">{title}</div>
      {sub && <div className="mt-1 text-sm text-gray-500 whitespace-pre-line text-center">{sub}</div>}
    </div>
  );
};

export default FeatureButton;