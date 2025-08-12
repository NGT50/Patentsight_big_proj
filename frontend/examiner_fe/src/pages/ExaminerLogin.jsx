import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, LogIn, Search, Key, FileText, Palette } from 'lucide-react';
import { loginUser } from '../api/auth';

// 로그인 컴포넌트
function ExaminerLogin({ onLoginSuccess = () => {} }) {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    patentType: '', // 'patent' 또는 'design'
    saveId: false
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // 저장된 아이디가 있으면 불러오기
    const savedId = localStorage.getItem('savedId');
    if (savedId) {
      setFormData(prev => ({
        ...prev,
        username: savedId,
        saveId: true
      }));
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!formData.username || !formData.password) {
      alert('아이디와 비밀번호를 입력해주세요.');
      setIsLoading(false);
      return;
    }

    if (!formData.patentType) {
      alert('심사유형을 선택해주세요.');
      setIsLoading(false);
      return;
    }

    try {
      // 백엔드 API 호출
      const response = await loginUser({
        username: formData.username,
        password: formData.password
      });

      // 로그인 성공 시 사용자 정보 구성
      const userData = {
        name: response.name || response.username || formData.username,
        username: formData.username,
        id: response.userId || response.user_id,
        role: response.role,
        patentType: formData.patentType
      };

      // 토큰 및 유저 정보 저장
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('isLoggedIn', 'true');

      // 아이디 저장 처리
      if (formData.saveId) {
        localStorage.setItem('savedId', formData.username);
      } else {
        localStorage.removeItem('savedId');
      }

      // 로그인 성공 콜백 호출
      onLoginSuccess(userData);
      
      alert('로그인 되었습니다. 서비스를 이용하실 수 있습니다.');
      
      // 심사유형에 따라 다른 대시보드로 이동
      if (formData.patentType === 'patent') {
        navigate('/patent-dashboard');
      } else if (formData.patentType === 'design') {
        navigate('/design-dashboard');
      }

    } catch (err) {
      console.error('로그인 오류:', err);
      setError(err.message || '로그인에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFindId = () => alert('아이디 찾기 기능 준비 중');
  const handleFindPassword = () => alert('비밀번호 찾기 기능 준비 중');
  const handleSignup = () => navigate('/terms');

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
              <h1 className="text-2xl font-bold text-white">심사관 로그인</h1>
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
                    name="username"
                    value={formData.username}
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

              {/* 심사유형 선택 */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  심사유형
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className={`flex items-center space-x-3 p-3 border-2 rounded-xl cursor-pointer transition-all ${
                    formData.patentType === 'patent' 
                      ? 'border-green-500 bg-green-50 shadow-md' 
                      : 'border-green-200 hover:border-green-300 hover:bg-green-50'
                  }`}>
                    <input
                      type="radio"
                      name="patentType"
                      value="patent"
                      checked={formData.patentType === 'patent'}
                      onChange={handleInputChange}
                      required
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                    />
                    <FileText className={`h-5 w-5 ${
                      formData.patentType === 'patent' ? 'text-green-600' : 'text-green-400'
                    }`} />
                    <span className={`text-sm font-medium ${
                      formData.patentType === 'patent' ? 'text-green-700' : 'text-green-600'
                    }`}>특허·실용신안</span>
                  </label>
                  <label className={`flex items-center space-x-3 p-3 border-2 rounded-xl cursor-pointer transition-all ${
                    formData.patentType === 'design' 
                      ? 'border-purple-500 bg-purple-50 shadow-md' 
                      : 'border-purple-200 hover:border-purple-300 hover:bg-purple-50'
                  }`}>
                    <input
                      type="radio"
                      name="patentType"
                      value="design"
                      checked={formData.patentType === 'design'}
                      onChange={handleInputChange}
                      required
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                    />
                    <Palette className={`h-5 w-5 ${
                      formData.patentType === 'design' ? 'text-purple-600' : 'text-purple-400'
                    }`} />
                    <span className={`text-sm font-medium ${
                      formData.patentType === 'design' ? 'text-purple-700' : 'text-purple-600'
                    }`}>디자인·상표</span>
                  </label>
                </div>
              </div>

              {/* 아이디 저장 */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="saveId"
                  checked={formData.saveId}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  아이디 저장
                </label>
              </div>

              {/* 에러 메시지 */}
              {error && <p className="text-red-600 text-sm text-center">{error}</p>}

              {/* 로그인 버튼 */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>로그인 중...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    <span>로그인</span>
                  </>
                )}
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

export default ExaminerLogin;