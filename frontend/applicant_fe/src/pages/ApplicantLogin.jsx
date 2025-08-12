import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
<<<<<<< HEAD
import styled from 'styled-components';
import axios from 'axios';
import useAuthStore from '../stores/authStore'; // 1. 우리가 만든 Zustand 스토어를 import 합니다.
import { loginUser } from '../api/auth'; // API 함수 import

const USE_API = false; // true면 실제 API, false면 임시(localStorage/mock)

const PageContainer = styled.div`
  max-width: 500px;
  margin: 0 auto;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  width: 100%;
  box-sizing: border-box;
  
  @media (max-width: 768px) {
    padding: 15px;
    margin: 10px;
  }
  
  @media (max-width: 480px) {
    padding: 10px;
    margin: 5px;
  }
`;

const LoginContainer = styled.div`
  padding: 40px;
  
  @media (max-width: 768px) {
    padding: 30px 20px;
  }
  
  @media (max-width: 480px) {
    padding: 20px 15px;
  }
`;

const Title = styled.h1`
  color: #0066cc;
  text-align: center;
  margin-bottom: 30px;
  font-size: 28px;
  font-weight: 700;
  
  @media (max-width: 768px) {
    font-size: 24px;
    margin-bottom: 25px;
  }
  
  @media (max-width: 480px) {
    font-size: 20px;
    margin-bottom: 20px;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
  
  @media (max-width: 768px) {
    gap: 15px;
  }
  
  @media (max-width: 480px) {
    gap: 12px;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-weight: 500;
  color: #333;
  font-size: 14px;
  
  @media (max-width: 480px) {
    font-size: 13px;
  }
`;

const Input = styled.input`
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  width: 100%;
  box-sizing: border-box;
  
  &:focus {
    border-color: #0066cc;
    outline: none;
  }
  
  @media (max-width: 768px) {
    padding: 10px;
    font-size: 13px;
  }
  
  @media (max-width: 480px) {
    padding: 8px;
    font-size: 12px;
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  
  @media (max-width: 768px) {
    gap: 8px;
  }
`;

const CheckboxItem = styled.label`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  cursor: pointer;
  
  input[type="checkbox"] {
    width: 18px;
    height: 18px;
  }
  
  @media (max-width: 768px) {
    font-size: 13px;
    gap: 8px;
  }
  
  @media (max-width: 480px) {
    font-size: 12px;
    gap: 6px;
  }
`;

const LoginButton = styled.button`
  background: #0066cc;
  color: white;
  padding: 15px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: #0052a3;
  }
  
  @media (max-width: 768px) {
    padding: 12px;
    font-size: 14px;
  }
  
  @media (max-width: 480px) {
    padding: 10px;
    font-size: 13px;
  }
`;

const Divider = styled.div`
  text-align: center;
  margin: 20px 0;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 1px;
    background: #ddd;
  }
  
  span {
    background: white;
    padding: 0 15px;
    color: #666;
    font-size: 14px;
  }
  
  @media (max-width: 768px) {
    margin: 15px 0;
    
    span {
      font-size: 13px;
      padding: 0 10px;
    }
  }
  
  @media (max-width: 480px) {
    margin: 12px 0;
    
    span {
      font-size: 12px;
      padding: 0 8px;
    }
  }
`;

const LinkGroup = styled.div`
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;
  
  @media (max-width: 768px) {
    gap: 15px;
    margin-top: 15px;
  }
  
  @media (max-width: 480px) {
    gap: 10px;
    margin-top: 12px;
  }
`;

const LinkButton = styled.button`
  background: none;
  border: none;
  color: #0066cc;
  font-size: 14px;
  cursor: pointer;
  text-decoration: underline;
  
  &:hover {
    color: #0052a3;
  }
  
  @media (max-width: 768px) {
    font-size: 13px;
  }
  
  @media (max-width: 480px) {
    font-size: 12px;
  }
`;

const SignupLink = styled.div`
  text-align: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
  
  span {
    color: #666;
    font-size: 14px;
  }
  
  button {
    background: none;
    border: none;
    color: #0066cc;
    font-size: 14px;
    cursor: pointer;
    text-decoration: underline;
    margin-left: 5px;
    
    &:hover {
      color: #0052a3;
    }
  }
  
  @media (max-width: 768px) {
    margin-top: 15px;
    padding-top: 15px;
    
    span, button {
      font-size: 13px;
    }
  }
  
  @media (max-width: 480px) {
    margin-top: 12px;
    padding-top: 12px;
    
    span, button {
      font-size: 12px;
    }
  }
`;
=======
import { User, Lock, LogIn, Search, Key } from 'lucide-react';
import useAuthStore from '../stores/authStore';
import { loginUser } from '../api/auth';
>>>>>>> origin/woncicd

// 로그인 컴포넌트
function ApplicantLogin() {
  const navigate = useNavigate();
  const { login, isLoggedIn } = useAuthStore(); 

<<<<<<< HEAD
  const [formData, setFormData] = useState({ id: '', password: '', keepLogin: false });
  const [error, setError] = useState('');
=======
  const [formData, setFormData] = useState({ username: '', password: '', keepLogin: false });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
>>>>>>> origin/woncicd

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
<<<<<<< HEAD
=======
    setIsLoading(true);
>>>>>>> origin/woncicd

    if (!formData.username || !formData.password) {
      alert('아이디와 비밀번호를 입력해주세요.');
      setIsLoading(false);
      return;
    }

    try {
<<<<<<< HEAD
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
=======
      // 백엔드 API 호출
      const response = await loginUser({
        username: formData.username,
        password: formData.password
      });

      // 디버깅: 백엔드 응답 확인
      console.log('로그인 응답 전체:', response);
      console.log('response.name:', response.name);
      console.log('response.username:', response.username);

      // 로그인 성공 시, Zustand의 login 함수 호출
      login({
        user: { 
          name: response.name || response.username || formData.username, 
          username: formData.username,
          id: response.userId || response.user_id 
        },
        token: response.token
>>>>>>> origin/woncicd
      });
      
      alert('로그인 되었습니다. 서비스를 이용하실 수 있습니다.');
      // 여기서 navigate를 호출하지 않습니다. useEffect가 처리합니다.

    } catch (err) {
      console.error('로그인 오류:', err);
      setError(err.message || '로그인에 실패했습니다.');
<<<<<<< HEAD
    }
  };
  
  return (
    <PageContainer>
      <LoginContainer>
        <Title>출원인 로그인</Title>
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>아이디 *</Label>
            <Input name="id" type="text" value={formData.id} onChange={handleInputChange} required />
          </FormGroup>
          <FormGroup>
            <Label>비밀번호 *</Label>
            <Input name="password" type="password" value={formData.password} onChange={handleInputChange} required />
          </FormGroup>

          {error && <p style={{ color: 'red', fontSize: '12px', textAlign: 'center' }}>{error}</p>}
          
          <CheckboxGroup>
            <CheckboxItem>
              <input name="keepLogin" type="checkbox" checked={formData.keepLogin} onChange={handleInputChange} />
              <span>로그인 상태 유지</span>
            </CheckboxItem>
          </CheckboxGroup>
          <LoginButton type="submit">로그인</LoginButton>
        </Form>
        <Divider><span>또는</span></Divider>
        <LinkGroup>
          <LinkButton type="button">아이디 찾기</LinkButton>
          <LinkButton type="button">비밀번호 찾기</LinkButton>
        </LinkGroup>
        <SignupLink>
          <span>아직 회원이 아니신가요?</span>
          <button type="button" onClick={() => navigate('/signup')}>회원가입</button>
        </SignupLink>
      </LoginContainer>
    </PageContainer>
=======
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
>>>>>>> origin/woncicd
  );
}

export default ApplicantLogin;