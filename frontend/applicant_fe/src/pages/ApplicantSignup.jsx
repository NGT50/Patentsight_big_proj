import React, { useState } from 'react';
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
  
  &:hover {
    background: #218838;
  }
  
  @media (max-width: 768px) {
    padding: 6px 12px;
    font-size: 11px;
  }
  
  @media (max-width: 480px) {
    padding: 5px 10px;
    font-size: 10px;
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

const PasswordHint = styled.div`
  font-size: 12px;
  color: #666;
  margin-top: 4px;
  line-height: 1.4;
  
  @media (max-width: 480px) {
    font-size: 11px;
  }
`;

function ApplicantSignup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    // businessNumber: '',
    // representative: '',
    address: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
    agreePrivacy: false,
    agreeMarketing: false
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/signup-complete');
  };

  const handleEmailAuth = () => {
    alert('이메일 인증');
  };

  return (
    <PageContainer>
      <FormContainer>
        <Title>출원인 회원가입</Title>
        
        <Form onSubmit={handleSubmit}>
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

          {/* <FormGroup>
            <Label>사업자등록번호 </Label>
            <AuthContainer>
              <Input
                type="text"
                name="businessNumber"
                value={formData.businessNumber}
                onChange={handleInputChange}
                placeholder="000-00-00000"
                required
                style={{ flex: 1 }}
              />
              <AuthButton type="button" onClick={handleBusinessNumberAuth}>
                인증
              </AuthButton>
            </AuthContainer>
          </FormGroup> */}

          <Row>
            {/* <FormGroup>
              <Label>대표자명 *</Label>
              <Input
                type="text"
                name="representative"
                value={formData.representative}
                onChange={handleInputChange}
                required
              />
            </FormGroup> */}
            
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

          <FormGroup>
            <Label>주소 *</Label>
            <Input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              required
            />
          </FormGroup>
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
              <Label>이메일 *</Label>
              <AuthContainer>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
              <AuthButton type="button" onClick={handleEmailAuth}>
                인증
              </AuthButton>
              </AuthContainer>
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
            <CheckboxItem>
              <input
                type="checkbox"
                name="agreeMarketing"
                checked={formData.agreeMarketing}
                onChange={handleInputChange}
              />
              <span>마케팅 정보 수신에 동의합니다 (선택)</span>
            </CheckboxItem>
          </CheckboxGroup>

          <ButtonGroup>
            <Button type="button" className="secondary" onClick={() => navigate('/')}>
              취소
            </Button>
            <Button type="submit" className="primary">
              회원가입
            </Button>
          </ButtonGroup>
        </Form>
      </FormContainer>
    </PageContainer>
  );
}

export default ApplicantSignup;