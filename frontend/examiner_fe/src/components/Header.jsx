// src/components/Header.jsx
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FileText, Clock } from 'lucide-react';

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [remainingTime, setRemainingTime] = useState('');
  const [loginTime, setLoginTime] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      const parsed = JSON.parse(stored);
      // 세션 만료 시간 (1시간 = 3600000ms)
      const expirationDuration = 3600000; 
      const expired = Date.now() - parsed.loginTime > expirationDuration;
      if (expired) {
        localStorage.removeItem('user');
        alert('세션이 만료되어 로그아웃되었습니다.');
        navigate('/');
      } else {
        setUser(parsed);
        setLoginTime(parsed.loginTime);
      }
    } else {
      // 로그인 정보가 없으면 로그인 페이지로 강제 이동
      // 현재 로그인 페이지가 '/'라고 가정
      if (location.pathname !== '/') { // 로그인 페이지 자체가 아니면 리다이렉트
        navigate('/');
      }
    }
  }, [navigate, location.pathname]); // location.pathname을 의존성 배열에 추가

  useEffect(() => {
    if (!loginTime) return;
    const expirationDuration = 3600000; // 1시간
    const interval = setInterval(() => {
      const remain = expirationDuration - (Date.now() - loginTime);
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
  }, [loginTime, navigate]);

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
      setLoginTime(newLoginTime);
      alert('로그인 시간이 연장되었습니다.');
    }
  };

  return (
    <div className="w-full bg-white border-b shadow-sm">
      {/* max-w-7xl mx-auto 를 제거하여 전체 너비를 사용하고, px-8로 좌우 패딩을 줍니다. */}
      <div className="px-8 py-4 flex justify-between items-center"> 
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => navigate('/patentdashboard')}
        >
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">특허 심사 현황</h1>
            <p className="text-sm text-gray-500">Patent Review Dashboard</p>
          </div>
        </div>

        <div className="flex items-center space-x-6 text-sm text-gray-700">
          <div className="flex items-center gap-2 text-gray-500">
            <Clock className="w-4 h-4" />
            {/* 현재 날짜와 시간으로 동적으로 표시하는 것이 좋습니다. */}
            <span>마지막 업데이트: {new Date().toLocaleDateString('ko-KR')} {new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>

          {user && (
            <>
              <span>👤 {user.name}님</span>
              <span>⏰ 남은 시간: {remainingTime}</span>
              <button onClick={handleKeepLogin} className="bg-gray-100 px-3 py-1 rounded hover:bg-gray-200">
                로그인 유지
              </button>
              <button onClick={handleLogout} className="bg-gray-100 px-3 py-1 rounded hover:bg-gray-200">
                로그아웃
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}