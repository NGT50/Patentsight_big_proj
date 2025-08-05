import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';

const PageContainer = styled.div`
  max-width: 600px;
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
  cursor: default; // 기본 커서로 변경
  pointer-events: none; // 라벨 전체에서 클릭 이벤트 비활성화
  
  input[type="radio"] {
    width: 18px;
    height: 18px;
    accent-color: #0066cc;
    cursor: pointer;
     pointer-events: auto; // 라디오 버튼에서만 클릭 이벤트 활성화
  
    /* 브라우저 호환성을 위한 추가 스타일 */
    &:checked {
      background-color: #0066cc;
      border-color: #0066cc;
  }
}

  span {
    cursor: pointer; // 텍스트에만 포인터 커서
    user-select: none;
    padding: 2px 0; // 텍스트 주변에만 클릭 영역 생성
    pointer-events: auto; // 텍스트에서만 클릭 이벤트 활성화
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

function ExaminerSignup() {
  const navigate = useNavigate();
  const location = useLocation();
  const authData = location.state?.authData;

  const [formData, setFormData] = useState({
    id: '',
    password: '',
    confirmPassword: '',
    email: '',
    phone: '',
    name: authData?.name || '',
    department: authData?.department || '',
    position: authData?.position || '',
    employeeNumber: authData?.employeeNumber || '',
    examinerField: 'patent',
    agreeTerms: false,
    agreePrivacy: false
  });

  useEffect(() => {
    if (authData) {
      setFormData(prev => ({
        ...prev,
        name: authData.name,
        department: authData.department,
        position: authData.position,
        employeeNumber: authData.employeeNumber
      }));
    }
  }, [authData]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
     setFormData(prev => ({
    ...prev,
    [name]: type === 'checkbox' ? checked : value
  }));
};

  const handleSubmit = (e) => {
  e.preventDefault();
  
  // 회원가입 정보를 localStorage에 저장
  const userData = {
    name: formData.name,
    id: formData.id,
    email: formData.email,
    phone: formData.phone,
    department: formData.department,
    position: formData.position,
    employeeNumber: formData.employeeNumber,
    examinerField: formData.examinerField
  };
  
  // 사용자 정보를 localStorage에 저장
  localStorage.setItem('registeredUsers', JSON.stringify({
    ...JSON.parse(localStorage.getItem('registeredUsers') || '{}'),
    [formData.id]: userData
  }));
  
  alert('회원가입이 완료되었습니다. 로그인해주세요.');
  navigate('/login');
};

  return (
    <PageContainer>
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
              name="id"
              value={formData.id}
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
                비밀번호는 8~16자리 영문, 숫자, 특수문자 (!@$%^*~#_-+=?{}[]) 조합으로 입력하십시오.<br/>
            
              </PasswordHint>
            </FormGroup>
            <FormGroup>
              <Label>비밀번호 확인 *</Label>
              <Input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
              />
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
                readOnly={!!authData}
              />
            </FormGroup>
            <FormGroup>
              <Label>부서 *</Label>
              <Input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                required
                readOnly={!!authData}
              />
            </FormGroup>
          </Row>

          <Row>
            <FormGroup>
              <Label>직급 *</Label>
              <Input
                type="text"
                name="position"
                value={formData.position}
                onChange={handleInputChange}
                required
                readOnly={!!authData}
              />
            </FormGroup>
            <FormGroup>
              <Label>사원번호 *</Label>
              <Input
                type="text"
                name="employeeNumber"
                value={formData.employeeNumber}
                onChange={handleInputChange}
                required
                readOnly={!!authData}
              />
            </FormGroup>
          </Row>

          <FormGroup>
            <Label>심사 분야 *</Label>
            <RadioGroup>
              <RadioItem>
                <input
                  type="radio"
                  name="examinerField"
                  value="patent"
                  checked={formData.examinerField === 'patent'}
                  onChange={handleInputChange}
                />
                <span>특허</span>
              </RadioItem>
              <RadioItem>
                <input
                  type="radio"
                  name="examinerField"
                  value="utility"
                  checked={formData.examinerField === 'utility'}
                  onChange={handleInputChange}
                />
                <span>실용신안</span>
              </RadioItem>
              <RadioItem>
                <input
                  type="radio"
                  name="examinerField"
                  value="design"
                  checked={formData.examinerField === 'design'}
                  onChange={handleInputChange}
                />
                <span>디자인</span>
              </RadioItem>
              <RadioItem>
                <input
                  type="radio"
                  name="examinerField"
                  value="trademark"
                  checked={formData.examinerField === 'trademark'}
                  onChange={handleInputChange}
                />
                <span>상표</span>
              </RadioItem>
            </RadioGroup>
          </FormGroup>

          <CheckboxGroup>
            <CheckboxItem>
              <input
                type="checkbox"
                name="agreeTerms"
                checked={formData.agreeTerms}
                onChange={handleInputChange}
                required
              />
              <span>이용약관에 동의합니다 *</span>
            </CheckboxItem>
            <CheckboxItem>
              <input
                type="checkbox"
                name="agreePrivacy"
                checked={formData.agreePrivacy}
                onChange={handleInputChange}
                required
              />
              <span>개인정보처리방침에 동의합니다 *</span>
            </CheckboxItem>
          </CheckboxGroup>

          <ButtonGroup>
            <Button type="button" className="secondary" onClick={() => navigate('/auth')}>
              취소
            </Button>
            <Button type="submit" className="primary">
              회원가입
            </Button>
          </ButtonGroup>
        </Form>
      </SignupContainer>
    </PageContainer>
  );
}

export default ExaminerSignup;