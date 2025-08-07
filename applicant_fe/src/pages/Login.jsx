import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../api/auth';
import useAuthStore from '../stores/authStore';
import Button from '../components/Button';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuthStore(); // Zustand 스토어의 login 액션을 가져옵니다.

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // 이전 에러 메시지 초기화
    try {
      const userData = await loginUser({ email, password });
      login(userData); // 로그인 성공 시 전역 상태 업데이트
      navigate('/mypage'); // 마이페이지로 이동
    } catch (err) {
      setError(err.message); // 에러 발생 시 메시지 표시
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-800">출원인 로그인</h2>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="text-sm font-medium text-gray-700">이메일 (아이디)</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="user@example.com"
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
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="********"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div>
            <Button type="submit" variant="primary">
                로그인
            </Button>
          </div>
          <div className="text-sm text-center text-gray-600">
            <a href="#" className="font-medium text-blue-600 hover:underline">아이디/비밀번호 찾기</a>
            <span className="mx-2">|</span>
            <a href="/signup" className="font-medium text-blue-600 hover:underline">회원가입</a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;