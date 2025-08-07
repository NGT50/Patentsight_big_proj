import React, { useEffect, useState } from 'react';

const TopBar = ({ onNotificationClick }) => {
  const [timeLeft, setTimeLeft] = useState(3600);
  // TopBar 내부의 자체적인 팝업 상태(showAlert)는 이제 필요 없으므로 삭제합니다.

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => prev > 0 ? prev - 1 : 0);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const m = String(Math.floor(seconds / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    // topbar div를 Tailwind 클래스로 교체
    <div className="relative flex items-center justify-end gap-4 p-3 bg-white border-b border-gray-200">
      <span className="text-sm text-gray-600">남은 시간: {formatTime(timeLeft)}</span>
      
      {/* 버튼들도 기본 스타일링 추가 */}
      <button className="px-3 py-1 text-sm text-white bg-blue-500 rounded hover:bg-blue-600">
        로그인 유지
      </button>
      <button className="px-3 py-1 text-sm text-gray-700 bg-gray-200 rounded hover:bg-gray-300">
        로그아웃
      </button>

      <button onClick={onNotificationClick} className="relative">
        <span className="text-xl">🔔</span>
        <span className="absolute top-0 right-0 flex items-center justify-center w-4 h-4 text-xs text-white bg-red-500 rounded-full">2</span>
      </button>
    
    </div>
  );
};

export default TopBar;