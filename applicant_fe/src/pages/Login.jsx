import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import { loginUser } from '../api/auth'; // 실제 API 호출은 잠시 주석 처리
import useAuthStore from '../stores/authStore';
import Button from '../components/Button';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // --- 가짜 로그인 로직 시작 ---
    const MOCK_USER = 'test';
    const MOCK_PASS = '1234';

    if (username === MOCK_USER && password === MOCK_PASS) {
      console.log('Mock 로그인 성공!');
      // 전역 상태를 로그인된 것으로 변경 (임시 사용자 정보 전달)
      login({ 
        user: { username: MOCK_USER, name: '테스트 출원인' }, 
        token: 'mock-jwt-token' 
      });
      // 마이페이지로 이동
      navigate('/mypage');
    } else {
      setError('아이디 또는 비밀번호가 잘못되었습니다.');
    }
    // --- 가짜 로그인 로직 끝 ---

    /* // 실제 API 호출 로직은 나중에 백엔드 연동 시 다시 활성화합니다.
      try {
        const userData = await loginUser({ username, password });
        login(userData);
        navigate('/mypage');
      } catch (err) {
        setError(err.message);
      }
    */
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-800">출원인 로그인</h2>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username" className="text-sm font-medium text-gray-700">사용자 아이디</label>
            <input
              id="username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              placeholder="아이디 입력"
            />
          </div>
          <div>
            <label htmlFor="password" className="text-sm font-medium text-gray-700">비밀번호</label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              placeholder="********"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="!mt-8">
            <Button type="submit" variant="primary" className="w-full">
              로그인
            </Button>
          </div>
          <div className="text-sm text-center text-gray-600">
            <button type="button" className="font-medium text-blue-600 hover:underline">아이디/비밀번호 찾기</button>
            <span className="mx-2">|</span>
            <a href="/signup" className="font-medium text-blue-600 hover:underline">회원가입</a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;