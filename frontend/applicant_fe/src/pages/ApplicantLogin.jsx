import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, LogIn, Search, Key } from 'lucide-react';
import axios from 'axios';
import useAuthStore from '../stores/authStore'; // 1. 우리가 만든 Zustand 스토어를 import 합니다.
import { loginUser } from '../api/auth'; // API 함수 import

const USE_API = false; // true면 실제 API, false면 임시(localStorage/mock)

// 로그인 컴포넌트
function ApplicantLogin() {
  const navigate = useNavigate();
  const { login, isLoggedIn } = useAuthStore(); 

  const [formData, setFormData] = useState({ id: '', password: '', keepLogin: false });
  const [error, setError] = useState('');

  // 로그인 상태가 true로 바뀌면 마이페이지로 이동
  useEffect(() => {
    if (isLoggedIn) {
      navigate('/mypage');
    }
  }, [isLoggedIn, navigate]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.id || !formData.password) {
      alert('아이디와 비밀번호를 입력해주세요.');
      return;
    }

    try {
      // README.md의 localStorage 방식으로 로그인 테스트
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '{}');
      const user = registeredUsers[formData.id];

      if (!user || user.password !== formData.password) {
        throw new Error('아이디 또는 비밀번호가 일치하지 않습니다.');
      }

      // 로그인 성공 시, Zustand의 login 함수만 호출
      login({
        user: { name: user.name, username: user.id },
        token: 'mock-localstorage-token'
      });
      
      alert('로그인 되었습니다. 서비스를 이용하실 수 있습니다.');
      // 여기서 navigate를 호출하지 않습니다. useEffect가 처리합니다.

    } catch (err) {
      console.error('로그인 오류:', err);
      setError(err.message || '로그인에 실패했습니다.');
    }
  };

  const handleFindId = () => alert('아이디 찾기 기능 준비 중');
  const handleFindPassword = () => alert('비밀번호 찾기 기능 준비 중');
  const handleSignup = () => navigate('/signup');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* 로그인 카드 */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* 헤더 */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
            <div className="flex items-center justify-center space-x-3">
              <div className="bg-white/20 rounded-full p-2">
                <User className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">출원인 로그인</h1>
            </div>
            <p className="text-blue-100 text-center mt-2 text-sm">
              특허 출원 AI 서비스에 오신 것을 환영합니다
            </p>
          </div>

          {/* 로그인 폼 */}
          <div className="px-8 py-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 아이디 입력 */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  아이디
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="id"
                    value={formData.id}
                    onChange={handleInputChange}
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="아이디를 입력하세요"
                  />
                </div>
              </div>

              {/* 비밀번호 입력 */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  비밀번호
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="비밀번호를 입력하세요"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* 로그인 상태 유지 */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="keepLogin"
                  checked={formData.keepLogin}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  로그인 상태 유지
                </label>
              </div>

              {/* 에러 메시지 */}
              {error && <p className="text-red-600 text-sm text-center">{error}</p>}

              {/* 로그인 버튼 */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <LogIn className="w-5 h-5" />
                <span>로그인</span>
              </button>
            </form>

            {/* 구분선 */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">또는</span>
              </div>
            </div>

            {/* 추가 링크들 */}
            <div className="flex justify-center space-x-6">
              <button
                type="button"
                onClick={handleFindId}
                className="flex items-center space-x-2 bg-gray-200 text-gray-700 hover:bg-gray-300 font-medium text-sm px-4 py-2 rounded-lg transition-colors"
              >
                <Search className="w-4 h-4" />
                <span>아이디 찾기</span>
              </button>
              <button
                type="button"
                onClick={handleFindPassword}
                className="flex items-center space-x-2 bg-gray-200 text-gray-700 hover:bg-gray-300 font-medium text-sm px-4 py-2 rounded-lg transition-colors"
              >
                <Key className="w-4 h-4" />
                <span>비밀번호 찾기</span>
              </button>
            </div>

            {/* 회원가입 링크 */}
            <div className="mt-6 pt-6 border-t border-gray-100 text-center">
              <span className="text-gray-600 text-sm">아직 회원이 아니신가요? </span>
              <button
                type="button"
                onClick={handleSignup}
                className="ml-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-medium text-sm px-4 py-2 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
              >
                회원가입
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ApplicantLogin;