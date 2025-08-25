import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

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

const MyPageContainer = styled.div`
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
  
  &:read-only {
    background-color: #f8f9fa;
    color: #666;
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
  
  input[type="radio"] {
    width: 18px;
    height: 18px;
    accent-color: #0066cc;
    cursor: pointer;
    margin: 0;
    
    &:checked {
      background-color: #0066cc;
      border-color: #0066cc;
    }
  }

  span {
    cursor: pointer;
    user-select: none;
    padding: 2px 0;
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

function ExaminerMyPage({ userInfo, onUpdateUserInfo }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    id: '',
    email: '',
    phone: '',
    name: '',
    department: '',
    position: '',
    employeeNumber: '',
    examinerField: 'patent'
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (userInfo) {
      setFormData({
        id: userInfo.id || '',
        email: userInfo.email || '',
        phone: userInfo.phone || '',
        name: userInfo.name || '',
        department: userInfo.department || '',
        position: userInfo.position || '',
        employeeNumber: userInfo.employeeNumber || '',
        examinerField: userInfo.examinerField || 'patent'
      });
    }
  }, [userInfo]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // localStorage에서 사용자 정보 업데이트
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '{}');
    registeredUsers[formData.id] = {
      ...registeredUsers[formData.id],
      ...formData
    };
    localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
    
    // 현재 로그인된 사용자 정보도 업데이트
    localStorage.setItem('userInfo', JSON.stringify(formData));
    
    // 부모 컴포넌트에 업데이트 알림
    if (onUpdateUserInfo) {
      onUpdateUserInfo(formData);
    }
    
    setIsEditing(false);
    alert('정보가 수정되었습니다.');
  };

  const handleCancel = () => {
    // 원래 정보로 되돌리기
    if (userInfo) {
      setFormData({
        id: userInfo.id || '',
        email: userInfo.email || '',
        phone: userInfo.phone || '',
        name: userInfo.name || '',
        department: userInfo.department || '',
        position: userInfo.position || '',
        employeeNumber: userInfo.employeeNumber || '',
        examinerField: userInfo.examinerField || 'patent'
      });
    }
    setIsEditing(false);
  };

  return (
    <PageContainer>
      <MyPageContainer>
        <Title>계정</Title>
        
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>아이디</Label>
            <Input
              type="text"
              name="id"
              value={formData.id}
              readOnly
            />
          </FormGroup>

          <Row>
            <FormGroup>
              <Label>이메일 *</Label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                readOnly={!isEditing}
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
                readOnly={!isEditing}
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
                readOnly={!isEditing}
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
                readOnly={!isEditing}
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
                readOnly={!isEditing}
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
                readOnly={!isEditing}
                required
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
                  disabled={!isEditing}
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
                  disabled={!isEditing}
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
                  disabled={!isEditing}
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
                  disabled={!isEditing}
                />
                <span>상표</span>
              </RadioItem>
            </RadioGroup>
          </FormGroup>

          <ButtonGroup>
            {!isEditing ? (
              <>
                <Button type="button" className="secondary" onClick={() => navigate('/')}>
                  돌아가기
                </Button>
                <Button type="button" className="primary" onClick={() => setIsEditing(true)}>
                  수정하기
                </Button>
              </>
            ) : (
              <>
                <Button type="button" className="secondary" onClick={handleCancel}>
                  취소
                </Button>
                <Button type="submit" className="primary">
                  저장
                </Button>
              </>
            )}
          </ButtonGroup>
        </Form>
      </MyPageContainer>
    </PageContainer>
  );
}

export default ExaminerMyPage;