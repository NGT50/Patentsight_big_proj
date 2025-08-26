import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { signupExaminer } from '../api/auth';

const PageContainer = styled.div`
  max-width: 800px;
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

const SignupContainer = styled.div`
  padding: 30px;
  
  @media (max-width: 768px) {
    padding: 20px;
  }
  
  @media (max-width: 480px) {
    padding: 15px;
  }
`;

const Title = styled.h1`
  color: #0066cc;
  text-align: center;
  margin-bottom: 20px;
  font-size: 28px;
  font-weight: 700;
  
  @media (max-width: 768px) {
    font-size: 24px;
    margin-bottom: 15px;
  }
  
  @media (max-width: 480px) {
    font-size: 20px;
    margin-bottom: 10px;
  }
`;

const Description = styled.p`
  text-align: center;
  color: #666;
  margin-bottom: 30px;
  font-size: 16px;
  line-height: 1.6;
  
  @media (max-width: 768px) {
    font-size: 14px;
    margin-bottom: 25px;
  }
  
  @media (max-width: 480px) {
    font-size: 13px;
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
  
  @media (max-width: 768px) {
    font-size: 13px;
  }
  
  @media (max-width: 480px) {
    font-size: 12px;
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

const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 30px;
  
  @media (max-width: 768px) {
    gap: 12px;
    margin-top: 25px;
  }
  
  @media (max-width: 480px) {
    flex-direction: column;
    gap: 10px;
    margin-top: 20px;
  }
`;

const Button = styled.button`
  padding: 12px 30px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &.primary {
    background: #0066cc;
    color: white;
    
    &:hover {
      background: #0052a3;
    }
  }
  
  &.secondary {
    background: #f5f5f5;
    color: #333;
    border: 1px solid #ddd;
    
    &:hover {
      background: #e5e5e5;
    }
  }
  
  @media (max-width: 768px) {
    padding: 10px 25px;
    font-size: 14px;
  }
  
  @media (max-width: 480px) {
    padding: 12px 20px;
    font-size: 13px;
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 20px;
  
  @media (max-width: 768px) {
    gap: 8px;
    margin-top: 15px;
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

const RadioGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  
  @media (max-width: 768px) {
    gap: 8px;
  }
`;

const RadioItem = styled.label`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  cursor: default;
  pointer-events: none;
  
  input[type="radio"] {
    width: 18px;
    height: 18px;
    accent-color: #0066cc;
    cursor: pointer;
    pointer-events: auto;
  
    &:checked {
      background-color: #0066cc;
      border-color: #0066cc;
    }
  }

  span {
    cursor: pointer;
    user-select: none;
    padding: 2px 0;
    pointer-events: auto;
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

const PasswordHint = styled.div`
  font-size: 12px;
  color: #666;
  margin-top: 4px;
  line-height: 1.4;
  
  @media (max-width: 480px) {
    font-size: 11px;
  }
`;

const PasswordStatus = styled.div`
  font-size: 12px;
  margin-top: 4px;
  padding: 4px 8px;
  border-radius: 4px;
  text-align: center;
  
  &.valid {
    background: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
  }
  
  &.invalid {
    background: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
  }
`;

const ConfirmPasswordInput = styled.div`
  position: relative;
  width: 100%;
`;

const ConfirmPasswordIcon = styled.span`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 16px;
  font-weight: bold;
  pointer-events: none;
  
  &.valid {
    color: #28a745;
  }
  
  &.invalid {
    color: #dc3545;
  }
  
  @media (max-width: 768px) {
    right: 10px;
    font-size: 14px;
  }
  
  @media (max-width: 480px) {
    right: 8px;
    font-size: 12px;
  }
`;

const ProgressContainer = styled.div`
  margin-bottom: 30px;
  
  @media (max-width: 768px) {
    margin-bottom: 25px;
  }
`;

const ProgressBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    margin-bottom: 15px;
  }
`;

const ProgressStep = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  
  @media (max-width: 768px) {
    gap: 6px;
  }
`;

const StepCircle = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  background: ${props => props.active ? '#0066cc' : '#e9ecef'};
  color: ${props => props.active ? 'white' : '#666'};
  
  @media (max-width: 768px) {
    width: 32px;
    height: 32px;
    font-size: 12px;
  }
`;

const StepLabel = styled.span`
  font-size: 12px;
  color: ${props => props.active ? '#0066cc' : '#666'};
  font-weight: ${props => props.active ? '600' : '400'};
  text-align: center;
  
  @media (max-width: 768px) {
    font-size: 11px;
  }
`;

const ProgressLine = styled.div`
  flex: 1;
  height: 2px;
  background: #e9ecef;
  margin: 0 10px;
  
  @media (max-width: 768px) {
    margin: 0 5px;
  }
`;

function ExaminerSignup() {
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    name: '',
    birthDate: '',
    email: '',
    phone: '',
    department: '',
    position: '',
    employeeNumber: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [passwordStatus, setPasswordStatus] = useState(''); // '', valid, invalid
  const [confirmPasswordStatus, setConfirmPasswordStatus] = useState(''); // '', valid, invalid

  useEffect(() => {
     window.scrollTo({
    top: 0,
    left: 0,
    behavior: 'smooth' // 부드러운 스크롤
  });
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // 연락처 자동 포맷팅
    if (name === 'phone') {
      // 숫자만 추출
      const numbers = value.replace(/[^0-9]/g, '');
      
      // 11자리까지만 허용
      if (numbers.length <= 11) {
        let formatted = '';
        if (numbers.length <= 3) {
          formatted = numbers;
        } else if (numbers.length <= 7) {
          formatted = `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
        } else {
          formatted = `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`;
        }
        
        setFormData(prev => ({
          ...prev,
          [name]: formatted
        }));
        return;
      }
    }
    
    // 생년월일 자동 포맷팅 (YYYY-MM-DD 형식)
    if (name === 'birthDate') {
      // 숫자만 추출
      const numbers = value.replace(/[^0-9]/g, '');
      
      // 8자리까지만 허용
      if (numbers.length <= 8) {
        let formatted = '';
        if (numbers.length <= 4) {
          formatted = numbers;
        } else if (numbers.length <= 6) {
          formatted = `${numbers.slice(0, 4)}-${numbers.slice(4)}`;
        } else {
          formatted = `${numbers.slice(0, 4)}-${numbers.slice(4, 6)}-${numbers.slice(6)}`;
        }
        
        setFormData(prev => ({
          ...prev,
          [name]: formatted
        }));
        return;
      }
    }
    
    // 비밀번호 검증
    if (name === 'password') {
      const password = value;
      
      // 비밀번호 규칙 검증
      const hasLength = password.length >= 8 && password.length <= 16;
      const hasLetter = /[a-zA-Z]/.test(password);
      const hasNumber = /[0-9]/.test(password);
      const hasSpecial = /[!@$%^*~#_\-+=?{}\[\]]/.test(password);
      
      if (password.length === 0) {
        setPasswordStatus('');
      } else if (hasLength && hasLetter && hasNumber && hasSpecial) {
        setPasswordStatus('valid');
      } else {
        setPasswordStatus('invalid');
      }
      
      // 비밀번호 확인 상태도 업데이트
      if (formData.confirmPassword) {
        if (password === formData.confirmPassword) {
          setConfirmPasswordStatus('valid');
        } else {
          setConfirmPasswordStatus('invalid');
        }
      }
    }
    
    // 비밀번호 확인 검증
    if (name === 'confirmPassword') {
      const confirmPassword = value;
      
      if (confirmPassword.length === 0) {
        setConfirmPasswordStatus('');
      } else if (confirmPassword === formData.password) {
        setConfirmPasswordStatus('valid');
      } else {
        setConfirmPasswordStatus('invalid');
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    // 비밀번호 확인 검증
    if (formData.password !== formData.confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      setIsLoading(false);
      return;
    }
    
    // 비밀번호 규칙 검증
    if (passwordStatus !== 'valid') {
      alert('비밀번호가 조건을 만족하지 않습니다.');
      setIsLoading(false);
      return;
    }
    
    // 비밀번호 확인 상태 검증
    if (confirmPasswordStatus !== 'valid') {
      alert('비밀번호 확인이 일치하지 않습니다.');
      setIsLoading(false);
      return;
    }

    try {
      // 백엔드 API 호출
      const signupData = {
        username: formData.username,
        password: formData.password,
        name: formData.name,
        birthDate: formData.birthDate,
        department: formData.department,
        employeeNumber: formData.employeeNumber,
        position: formData.position
      };
      
      await signupExaminer(signupData);
      
      alert('회원가입이 완료되었습니다. 로그인해주세요.');
      navigate('/login');
    } catch (error) {
      console.error('회원가입 오류:', error);
      setError(error.message || '회원가입에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageContainer>
      <ProgressContainer>
        <ProgressBar>
          <ProgressStep>
            <StepCircle active={false}>✓</StepCircle>
            <StepLabel active={false}>약관동의</StepLabel>
          </ProgressStep>
          <ProgressLine />
          <ProgressStep>
            <StepCircle active={true}>2</StepCircle>
            <StepLabel active={true}>기본정보 입력</StepLabel>
          </ProgressStep>
          <ProgressLine />
          <ProgressStep>
            <StepCircle active={false}>3</StepCircle>
            <StepLabel active={false}>가입완료</StepLabel>
          </ProgressStep>
        </ProgressBar>
      </ProgressContainer>

      <SignupContainer>
        <Title>심사관 회원가입</Title>
        <Description>
          인증이 완료되었습니다. 회원가입을 완료해주세요.
        </Description>
        
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>아이디 *</Label>
            <Input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              required
            />
          </FormGroup>

          <Row>
            <FormGroup>
              <Label>비밀번호 *</Label>
              <Input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
              <PasswordHint>
                비밀번호는 8~16자리 영문, 숫자, 특수문자 (!@$%^*~#_-+=?{}[]) 조합으로 입력하십시오.
              </PasswordHint>
              {passwordStatus && (
                <PasswordStatus className={passwordStatus}>
                  {passwordStatus === 'valid' ? '올바른 비밀번호 입니다.' : 
                   passwordStatus === 'invalid' ? '올바르지 않은 비밀번호 입니다.' : ''}
                </PasswordStatus>
              )}
            </FormGroup>
            <FormGroup>
              <Label>비밀번호 확인 *</Label>
              <ConfirmPasswordInput>
                <Input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                />
                {confirmPasswordStatus && (
                  <ConfirmPasswordIcon className={confirmPasswordStatus}>
                    {confirmPasswordStatus === 'valid' ? '✓' : '✗'}
                  </ConfirmPasswordIcon>
                )}
              </ConfirmPasswordInput>
            </FormGroup>
          </Row>

          <Row>
            <FormGroup>
              <Label>이메일 *</Label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </FormGroup>
            <FormGroup>
              <Label>연락처 *</Label>
              <Input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="010-1234-5678"
                maxLength="13"
                required
              />
            </FormGroup>
          </Row>

          <Row>
            <FormGroup>
              <Label>이름 *</Label>
              <Input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </FormGroup>
            <FormGroup>
              <Label>생년월일 *</Label>
              <Input
                type="text"
                name="birthDate"
                value={formData.birthDate}
                onChange={handleInputChange}
                placeholder="YYYY-MM-DD"
                maxLength="10"
                required
              />
            </FormGroup>
          </Row>

          <Row>
            <FormGroup>
              <Label>부서 *</Label>
              <Input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                placeholder="부서명을 입력하세요"
                required
              />
            </FormGroup>
            <FormGroup>
              <Label>직급 *</Label>
              <Input
                type="text"
                name="position"
                value={formData.position}
                onChange={handleInputChange}
                required
              />
            </FormGroup>
          </Row>

          <Row>
            <FormGroup>
              <Label>사원번호 *</Label>
              <Input
                type="text"
                name="employeeNumber"
                value={formData.employeeNumber}
                onChange={handleInputChange}
                required
              />
            </FormGroup>
          </Row>



          {/* 에러 메시지 */}
          {error && (
            <div style={{ color: 'red', textAlign: 'center', marginBottom: '10px' }}>
              {error}
            </div>
          )}
          
          <Button type="submit" className="primary" disabled={isLoading}>
            {isLoading ? '회원가입 중...' : '회원가입'}
          </Button>

          <ButtonGroup>
            <Button type="button" className="secondary" onClick={() => navigate('/auth')}>
              이전
            </Button>
            <Button type="button" className="secondary" onClick={() => navigate('/auth')}>
              취소
            </Button>
            
          </ButtonGroup>
        </Form>
      </SignupContainer>
    </PageContainer>
  );
}

export default ExaminerSignup;