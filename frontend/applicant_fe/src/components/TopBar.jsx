import React, { useEffect, useState } from 'react';
import './TopBar.css';

const TopBar = () => {
  const [timeLeft, setTimeLeft] = useState(3600); // 1시간(3600초)
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          alert("세션이 만료되어 로그아웃됩니다.");
          // 로그아웃 처리 로직 (예: localStorage 제거 등)
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
    <div className="topbar">
      <span>남은 시간: {formatTime(timeLeft)}</span>
      <button onClick={() => alert("세션 연장!")}>로그인 유지</button>
      <button onClick={() => alert("로그아웃!")}>로그아웃</button>
      <button onClick={() => setShowAlert(!showAlert)}>🔔 2</button>
      {showAlert && (
        <div className="alert-popup">
          <p>심사관으로부터 보완 요청이 왔습니다.</p>
          <p>8/3 특허 최종 심사 완료되었습니다.</p>
        </div>
      )}
    </div>
  );
};

export default TopBar;
