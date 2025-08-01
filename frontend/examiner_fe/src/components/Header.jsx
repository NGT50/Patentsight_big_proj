// src/components/Header.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Header() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [remainingTime, setRemainingTime] = useState('');
  const [loginTime, setLoginTime] = useState(null); // ✅ loginTime 따로 관리

  // 로그인 정보 불러오기
  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      const parsed = JSON.parse(stored);
      const expired = Date.now() - parsed.loginTime > 3600000;

      if (expired) {
        localStorage.removeItem('user');
        alert('세션이 만료되어 로그아웃되었습니다.');
        navigate('/');
      } else {
        setUser(parsed);
        setLoginTime(parsed.loginTime); // ✅ 이 시점에 loginTime 설정
      }
    } else {
      navigate('/');
    }
  }, [navigate]);

  // 남은 시간 타이머
  useEffect(() => {
    if (!loginTime) return;

    const interval = setInterval(() => {
      const remain = 3600000 - (Date.now() - loginTime);
      if (remain <= 0) {
        clearInterval(interval);
        localStorage.removeItem('user');
        alert('세션이 만료되어 로그아웃되었습니다.');
        navigate('/');
      } else {
        const minutes = Math.floor(remain / 60000);
        const seconds = Math.floor((remain % 60000) / 1000);
        setRemainingTime(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [loginTime, navigate]); // ✅ loginTime 바뀌면 타이머도 재설정됨

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleKeepLogin = () => {
    const stored = localStorage.getItem('user');
    if (stored) {
      const parsed = JSON.parse(stored);
      const newLoginTime = Date.now();
      parsed.loginTime = newLoginTime;
      localStorage.setItem('user', JSON.stringify(parsed));

      setLoginTime(newLoginTime); // ✅ state도 갱신해서 타이머 리셋
      alert('로그인 시간이 연장되었습니다.');
    }
  };

  return (
    <div className="w-full bg-white py-4 px-6 border-b shadow-sm flex justify-between items-center">
      <div className="text-xl font-bold text-blue-600 cursor-pointer" onClick={() => navigate('/patentdashboard')}>
        특허톡 심사관 시스템
      </div>

      {user && (
        <div className="flex items-center gap-6 text-sm text-gray-700">
          <span>👤 {user.name}님</span>
          <span>⏰ 남은 시간: {remainingTime}</span>
          <button onClick={handleKeepLogin} className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300">
            로그인 유지
          </button>
          <button onClick={handleLogout} className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300">
            로그아웃
          </button>
        </div>
      )}
    </div>
  );
}
