import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';

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

// 로그인 컴포넌트
function ApplicantLogin({ onLoginSuccess = () => {} }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    id: '',
    password: '',
    keepLogin: false
  });

  useEffect(() => {
    window.scrollTo(0, 0);
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

    if (!formData.id || !formData.password) {
      alert('아이디와 비밀번호를 입력해주세요.');
      return;
    }

    try {
      let userData;

      if (USE_API) {
        // ✅ 실제 백엔드 로그인 API 호출
        const response = await axios.post('/api/users/login', {
          username: formData.id,
          password: formData.password
        });

        const { token, user_id, username, role } = response.data;

        // 토큰 및 유저 정보 저장
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify({ user_id, username, role }));

        userData = { user_id, username, role };

      } else {
        // ✅ 임시 로컬 테스트 (localStorage에 저장된 유저로 로그인)
        const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '{}');
        const user = registeredUsers[formData.id];

        if (!user || user.password !== formData.password) {
          throw new Error('아이디 또는 비밀번호가 일치하지 않습니다.');
        }

        userData = {
          name: user.name,
          id: user.id,
          email: user.email,
          phone: user.phone,
          address: user.address
        };

        localStorage.setItem('user', JSON.stringify(userData));
      }

      // 로그인 성공
      onLoginSuccess(userData);
      alert('로그인 되었습니다. 서비스를 이용하실 수 있습니다.');
      navigate('/dashboard');

    } catch (err) {
      console.error('로그인 오류:', err);
      alert(err.message || '로그인에 실패했습니다.');
    }
  };

  const handleFindId = () => alert('아이디 찾기 기능 준비 중');
  const handleFindPassword = () => alert('비밀번호 찾기 기능 준비 중');
  const handleSignup = () => navigate('/terms');

  return (
    <PageContainer>
      <LoginContainer>
        <Title>출원인 로그인</Title>
        
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>아이디 *</Label>
            <Input
              type="text"
              name="id"
              value={formData.id}
              onChange={handleInputChange}
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>비밀번호 *</Label>
            <Input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
          </FormGroup>

          <CheckboxGroup>
            <CheckboxItem>
              <input
                type="checkbox"
                name="keepLogin"
                checked={formData.keepLogin}
                onChange={handleInputChange}
              />
              <span>로그인 상태 유지</span>
            </CheckboxItem>
          </CheckboxGroup>

          <LoginButton type="submit">
            로그인
          </LoginButton>
        </Form>

        <Divider>
          <span>또는</span>
        </Divider>

        <LinkGroup>
          <LinkButton type="button" onClick={handleFindId}>
            아이디 찾기
          </LinkButton>
          <LinkButton type="button" onClick={handleFindPassword}>
            비밀번호 찾기
          </LinkButton>
        </LinkGroup>

        <SignupLink>
          <span>아직 회원이 아니신가요?</span>
          <button type="button" onClick={handleSignup}>
            회원가입
          </button>
        </SignupLink>
      </LoginContainer>
    </PageContainer>
  );
}

export default ApplicantLogin;