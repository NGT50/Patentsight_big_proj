import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

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

const FormContainer = styled.div`
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

const AuthButton = styled.button`
  background: #28a745;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  height: 44px;
  flex-shrink: 0;
  margin-left: auto;
  
  &:hover {
    background: #218838;
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
  
  @media (max-width: 768px) {
    padding: 6px 12px;
    font-size: 11px;
    height: 40px;
  }
  
  @media (max-width: 480px) {
    padding: 5px 10px;
    font-size: 10px;
    height: 36px;
  }
`;

const AuthContainer = styled.div`
  display: flex;
  gap: 10px;
  
  @media (max-width: 768px) {
    gap: 8px;
  }
  
  @media (max-width: 480px) {
    gap: 6px;
  }
`;

const EmailContainer = styled.div`
  display: flex;
  gap: 15px;
  align-items: center;
  width: 100%;
  justify-content: space-between;
  
  @media (max-width: 768px) {
    gap: 12px;
  }
  
  @media (max-width: 480px) {
    gap: 10px;
  }
`;

const EmailInput = styled.input`
  flex: 1;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
  height: 44px;
  
  &:focus {
    border-color: #0066cc;
    outline: none;
  }
  
  @media (max-width: 768px) {
    padding: 10px;
    font-size: 13px;
    height: 40px;
  }
  
  @media (max-width: 480px) {
    padding: 8px;
    font-size: 12px;
    height: 36px;
  }
`;

const DomainSelect = styled.select`
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  background: white;
  cursor: pointer;
  min-width: 150px;
  width: 150px;
  height: 44px;
  flex-shrink: 0;
  
  &:focus {
    border-color: #0066cc;
    outline: none;
  }
  
  @media (max-width: 768px) {
    padding: 10px;
    font-size: 13px;
    min-width: 130px;
    width: 130px;
    height: 40px;
  }
  
  @media (max-width: 480px) {
    padding: 8px;
    font-size: 12px;
    min-width: 110px;
    width: 110px;
    height: 36px;
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

const EmailStatus = styled.div`
  font-size: 12px;
  margin-top: 4px;
  padding: 4px 8px;
  border-radius: 4px;
  text-align: center;
  
  &.pending {
    background: #fff3cd;
    color: #856404;
    border: 1px solid #ffeaa7;
  }
  
  &.verified {
    background: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
  }
  
  &.error {
    background: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
  }
`;

function ApplicantSignup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    address: '',
    phone: '',
    emailId: '',
    emailDomain: 'naver.com',
    password: '',
    birthDate: '',
    confirmPassword: '',
    agreeTerms: false,
    agreePrivacy: false,
    agreeMarketing: false
  });

  const [emailStatus, setEmailStatus] = useState(''); // '', pending, verified, error
  const [isEmailVerified, setIsEmailVerified] = useState(false);
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
    
    // 생년월일 자동 포맷팅
    if (name === 'birthDate') {
      // 숫자만 추출
      const numbers = value.replace(/[^0-9]/g, '');
      
      // 8자리까지만 허용 (YYYYMMDD)
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

  const handleEmailAuth = () => {
    if (!formData.emailId) {
      alert('이메일 아이디를 입력해주세요.');
      return;
    }

    const fullEmail = `${formData.emailId}@${formData.emailDomain}`;
    
    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(fullEmail)) {
      setEmailStatus('error');
      alert('올바른 이메일 형식이 아닙니다.');
      return;
    }

    // 인증 진행 중 상태
    setEmailStatus('pending');
    
    // 실제로는 서버에 인증 요청을 보내야 함
    // 여기서는 시뮬레이션
    setTimeout(() => {
      setEmailStatus('verified');
      setIsEmailVerified(true);
      alert('인증 메일이 발송되었습니다. 메일함을 확인해주세요.');
    }, 1000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // 이메일 인증 확인
    if (!isEmailVerified) {
      alert('이메일 인증을 완료해주세요.');
      return;
    }

    // 비밀번호 확인 검증
    if (formData.password !== formData.confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }
    
    // 비밀번호 규칙 검증
    if (passwordStatus !== 'valid') {
      alert('비밀번호가 조건을 만족하지 않습니다.');
      return;
    }
    
    // 비밀번호 확인 상태 검증
    if (confirmPasswordStatus !== 'valid') {
      alert('비밀번호 확인이 일치하지 않습니다.');
      return;
    }

    // 필수 약관 동의 검증
    if (!formData.agreeTerms || !formData.agreePrivacy) {
      alert('필수 약관에 동의해주세요.');
      return;
    }

    // 회원가입 정보를 localStorage에 저장
    const userData = {
      name: formData.name,
      id: formData.id,
      password: formData.password,
      email: `${formData.emailId}@${formData.emailDomain}`,
      phone: formData.phone,
      address: formData.address
    };
    
    // 사용자 정보를 localStorage에 저장
    localStorage.setItem('registeredUsers', JSON.stringify({
      ...JSON.parse(localStorage.getItem('registeredUsers') || '{}'),
      [formData.id]: userData
    }));

    navigate('/signup-complete');
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
    
      <FormContainer>
        <Title>출원인 회원가입</Title>
        
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>아이디 *</Label>
            <Input type="text" name="id" value={formData.id} onChange={handleInputChange} required />
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
              <Label>이름 *</Label>
              <Input type="text" name="name" value={formData.name} onChange={handleInputChange} required />
            </FormGroup>
            <FormGroup>
              <Label>생년월일 *</Label>
              <Input 
                type="text" 
                name="birthDate" 
                value={formData.birthDate} 
                onChange={handleInputChange} 
                placeholder="1990-01-01"
                maxLength="10"
                required 
              />
            </FormGroup>
          </Row>

          <Row>
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
            <FormGroup>
              <Label>주소 *</Label>
              <Input type="text" name="address" value={formData.address} onChange={handleInputChange} required />
            </FormGroup>
          </Row>

                    <FormGroup>
            <Label>이메일 *</Label>
            <EmailContainer>
              <EmailInput 
                type="text" 
                name="emailId" 
                value={formData.emailId} 
                onChange={handleInputChange} 
                placeholder="이메일 아이디"
                required 
              />
              <span style={{ fontSize: '14px', color: '#666' }}>@</span>
              <DomainSelect 
                name="emailDomain" 
                value={formData.emailDomain} 
                onChange={handleInputChange}
              >
                <option value="naver.com">naver.com</option>
                <option value="gmail.com">gmail.com</option>
                <option value="daum.net">daum.net</option>
                <option value="hanmail.net">hanmail.net</option>
                <option value="nate.com">nate.com</option>
                <option value="hotmail.com">hotmail.com</option>
                <option value="outlook.com">outlook.com</option>
                <option value="yahoo.com">yahoo.com</option>
                <option value="직접입력">직접입력</option>
              </DomainSelect>
              <AuthButton 
                type="button" 
                onClick={handleEmailAuth}
                disabled={emailStatus === 'pending'}
              >
                {emailStatus === 'pending' ? '인증중...' : '인증'}
              </AuthButton>
            </EmailContainer>
            {formData.emailDomain === '직접입력' && (
              <Input 
                type="text" 
                name="customDomain" 
                placeholder="도메인을 입력하세요 (예: example.com)"
                style={{ marginTop: '8px' }}
              />
            )}
            {emailStatus && emailStatus !== 'pending' && (
              <EmailStatus className={emailStatus}>
                {emailStatus === 'verified' ? '✓ 이메일 인증이 완료되었습니다.' : 
                 emailStatus === 'error' ? '✗ 이메일 인증에 실패했습니다.' : ''}
              </EmailStatus>
            )}
          </FormGroup>

          <div style={{ marginTop: '20px' }}></div>

          <FormGroup>
            
            <div>
              <label><input type="checkbox" name="agreeTerms" checked={formData.agreeTerms} onChange={handleInputChange} required /> 이용약관에 동의합니다</label><br/>
              <label><input type="checkbox" name="agreePrivacy" checked={formData.agreePrivacy} onChange={handleInputChange} required /> 개인정보처리방침에 동의합니다</label><br/>
              <label><input type="checkbox" name="agreeMarketing" checked={formData.agreeMarketing} onChange={handleInputChange} /> 마케팅 정보 수신에 동의합니다 (선택)</label>
            </div>
          </FormGroup>

          <ButtonGroup>
            <Button type="button" className="secondary" onClick={() => navigate('/')}>취소</Button>
            <Button type="submit" className="primary">회원가입</Button>
          </ButtonGroup>
        </Form>
      </FormContainer>
    </PageContainer>
  );
}

export default ApplicantSignup; 