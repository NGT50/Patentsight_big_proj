import React, { useEffect, useState } from 'react';

// import './TopBar.css'; // 삭제

const TopBar = () => {
  const [timeLeft, setTimeLeft] = useState(3600);
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          alert("세션이 만료되어 로그아웃됩니다.");
          // 추후 로그아웃 로직 연동
        }
        return prev - 1;
      });
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

      <button onClick={() => setShowAlert(!showAlert)} className="relative">
        <span className="text-xl">🔔</span>
        <span className="absolute top-0 right-0 flex items-center justify-center w-4 h-4 text-xs text-white bg-red-500 rounded-full">2</span>
      </button>
      
      {/* alert-popup div를 Tailwind 클래스로 교체 */}
      {showAlert && (
        <div className="absolute top-14 right-5 w-64 p-3 bg-white border border-gray-300 rounded-md shadow-lg z-10">
          <p className="pb-2 mb-2 text-sm border-b border-gray-200">심사관으로부터 보완 요청이 왔습니다.</p>
          <p className="text-sm">8/3 특허 최종 심사 완료되었습니다.</p>
        </div>
      )}
    </div>
  );
};

export default TopBar;