import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

const CompleteContainer = styled.div`
  padding: 40px;
  text-align: center;
  
  @media (max-width: 768px) {
    padding: 30px 20px;
  }
  
  @media (max-width: 480px) {
    padding: 20px 15px;
  }
`;

const SuccessIcon = styled.div`
  width: 80px;
  height: 80px;
  background: #0066cc;
  border-radius: 50%;
  margin: 0 auto 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 40px;
  font-weight: bold;
  
  @media (max-width: 768px) {
    width: 60px;
    height: 60px;
    font-size: 30px;
    margin-bottom: 15px;
  }
  
  @media (max-width: 480px) {
    width: 50px;
    height: 50px;
    font-size: 25px;
    margin-bottom: 10px;
  }
`;

const Title = styled.h1`
  color: #0066cc;
  margin-bottom: 20px;
  font-size: 24px;
  font-weight: 700;
  
  @media (max-width: 768px) {
    font-size: 20px;
    margin-bottom: 15px;
  }
  
  @media (max-width: 480px) {
    font-size: 18px;
    margin-bottom: 10px;
  }
`;

const Message = styled.p`
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

const InfoBox = styled.div`
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 30px;
  
  @media (max-width: 768px) {
    padding: 15px;
    margin-bottom: 25px;
  }
  
  @media (max-width: 480px) {
    padding: 12px;
    margin-bottom: 20px;
  }
`;

const InfoItem = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  @media (max-width: 480px) {
    flex-direction: column;
    gap: 5px;
    text-align: center;
  }
`;

const InfoLabel = styled.span`
  font-weight: 500;
  color: #333;
  
  @media (max-width: 768px) {
    font-size: 14px;
  }
  
  @media (max-width: 480px) {
    font-size: 13px;
  }
`;

const InfoValue = styled.span`
  color: #0066cc;
  font-weight: 600;
  
  @media (max-width: 768px) {
    font-size: 14px;
  }
  
  @media (max-width: 480px) {
    font-size: 13px;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 15px;
  justify-content: center;
  
  @media (max-width: 768px) {
    gap: 12px;
  }
  
  @media (max-width: 480px) {
    flex-direction: column;
    gap: 10px;
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

function ApplicantSignupComplete() {
  const navigate = useNavigate();
  
  const membershipNumber = 'AP' + Date.now().toString().slice(-8);
  const signupDate = new Date().toLocaleDateString('ko-KR');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  return (
    <PageContainer>
      <CompleteContainer>
        <SuccessIcon>✓</SuccessIcon>
        <Title>회원가입이 완료되었습니다!</Title>
        <Message>
          특허청 특허정보시스템에 가입해주셔서 감사합니다.<br />
          이제 모든 서비스를 이용하실 수 있습니다.
        </Message>
        
        <InfoBox>
          <InfoItem>
            <InfoLabel>회원번호:</InfoLabel>
            <InfoValue>{membershipNumber}</InfoValue>
          </InfoItem>
          <InfoItem>
            <InfoLabel>가입일:</InfoLabel>
            <InfoValue>{signupDate}</InfoValue>
          </InfoItem>
        </InfoBox>
        
        <ButtonGroup>
          <Button className="secondary" onClick={() => navigate('/')}>
            메인으로
          </Button>
          <Button className="primary" onClick={() => navigate('/login')}>
            로그인
          </Button>
        </ButtonGroup>
      </CompleteContainer>
    </PageContainer>
  );
}

export default ApplicantSignupComplete;