import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { verifyExaminerCode } from '../api/auth';

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

const AuthContainer = styled.div`
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

const AuthButton = styled.button`
  background: #0066cc;
  color: white;
  padding: 12px 30px;
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
    padding: 10px 25px;
    font-size: 14px;
  }
  
  @media (max-width: 480px) {
    padding: 12px 20px;
    font-size: 13px;
  }
`;

function ExaminerAuth() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    department: '',
    position: '',
    employeeNumber: '',
    examinerCode: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // 백엔드 API 호출
      const response = await verifyExaminerCode({
        authCode: formData.examinerCode
      });

      if (response.verified) {
        // 인증 성공 시 회원가입 페이지로 이동
        navigate('/signup', { 
          state: { 
            authData: {
              name: formData.name,
              department: formData.department,
              position: formData.position,
              employeeNumber: formData.employeeNumber
            }
          } 
        });
      } else {
        setError('심사관 코드가 올바르지 않습니다.');
      }
    } catch (error) {
      console.error('인증 오류:', error);
      setError(error.message || '인증에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageContainer>
      <AuthContainer>
        <Title>심사관 인증</Title>
        <Description>
          심사관으로 가입하기 위해서는 관리자가 발급한 심사관 코드가 필요합니다.<br />
          코드가 일치하면 회원가입이 가능합니다.
        </Description>
        
        <Form onSubmit={handleSubmit}>
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
              <Label>부서 *</Label>
              <Input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                required
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
              />
            </FormGroup>
          </Row>

          <FormGroup>
            <Label>[필수] 심사관 코드: [________] (관리자가 발급한 코드) *</Label>
            <Input
              type="text"
              name="examinerCode"
              value={formData.examinerCode}
              onChange={handleInputChange}
              placeholder="심사관 코드를 입력하세요"
              required
            />
          </FormGroup>

          {/* 에러 메시지 */}
          {error && (
            <div style={{ color: 'red', textAlign: 'center', marginBottom: '10px' }}>
              {error}
            </div>
          )}

          <ButtonGroup>
            <Button type="button" className="secondary" onClick={() => navigate('/login')}>
              취소
            </Button>
            <AuthButton type="submit" disabled={isLoading}>
              {isLoading ? '인증 중...' : '인증 확인'}
            </AuthButton>
          </ButtonGroup>
        </Form>
      </AuthContainer>
    </PageContainer>
  );
}

export default ExaminerAuth;