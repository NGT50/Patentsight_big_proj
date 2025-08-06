import React, { useEffect } from 'react';
import styled from 'styled-components';

const DashboardContainer = styled.div`
  width: 100%;
  padding: 20px;
  box-sizing: border-box;
  
  @media (max-width: 768px) {
    padding: 15px;
  }
  
  @media (max-width: 480px) {
    padding: 10px;
  }
`;

const Title = styled.h1`
  color: #0066cc;
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

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
  width: 100%;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 15px;
    margin-bottom: 25px;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 10px;
    margin-bottom: 20px;
  }
`;

const StatCard = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
  min-height: 120px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  
  @media (max-width: 768px) {
    padding: 15px;
    min-height: 100px;
  }
  
  @media (max-width: 480px) {
    padding: 12px;
    min-height: 80px;
  }
`;

const StatNumber = styled.div`
  font-size: 32px;
  font-weight: 700;
  color: #0066cc;
  margin-bottom: 10px;
  
  @media (max-width: 768px) {
    font-size: 28px;
    margin-bottom: 8px;
  }
  
  @media (max-width: 480px) {
    font-size: 24px;
    margin-bottom: 5px;
  }
`;

const StatLabel = styled.div`
  color: #666;
  font-size: 14px;
  
  @media (max-width: 768px) {
    font-size: 13px;
  }
  
  @media (max-width: 480px) {
    font-size: 12px;
  }
`;

const QuickActions = styled.div`
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
  width: 100%;
  
  @media (max-width: 768px) {
    padding: 20px;
    margin-bottom: 25px;
  }
  
  @media (max-width: 480px) {
    padding: 15px;
    margin-bottom: 20px;
  }
`;

const QuickActionsTitle = styled.h2`
  color: #333;
  margin-bottom: 20px;
  font-size: 20px;
  font-weight: 600;
  
  @media (max-width: 768px) {
    font-size: 18px;
    margin-bottom: 15px;
  }
  
  @media (max-width: 480px) {
    font-size: 16px;
    margin-bottom: 10px;
  }
`;

const ActionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  width: 100%;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 12px;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 10px;
  }
`;

const ActionButton = styled.button`
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  padding: 15px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
  width: 100%;
  box-sizing: border-box;
  
  &:hover {
    background: #e9ecef;
    border-color: #0066cc;
  }
  
  @media (max-width: 768px) {
    padding: 12px;
  }
  
  @media (max-width: 480px) {
    padding: 10px;
  }
`;

const ActionTitle = styled.div`
  font-weight: 600;
  color: #333;
  margin-bottom: 5px;
  font-size: 14px;
  
  @media (max-width: 768px) {
    font-size: 13px;
    margin-bottom: 4px;
  }
  
  @media (max-width: 480px) {
    font-size: 12px;
    margin-bottom: 3px;
  }
`;

const ActionDesc = styled.div`
  font-size: 12px;
  color: #666;
  
  @media (max-width: 768px) {
    font-size: 11px;
  }
  
  @media (max-width: 480px) {
    font-size: 10px;
  }
`;

function ExaminerDashboard() {

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth' // 부드러운 스크롤
    });
  }, []);

  return (
    <DashboardContainer>
      <Title>심사관 대시보드</Title>
      
      <StatsGrid>
        <StatCard>
          <StatNumber>25</StatNumber>
          <StatLabel>대기중인 심사</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber>8</StatNumber>
          <StatLabel>진행중인 심사</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber>156</StatNumber>
          <StatLabel>완료된 심사</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber>5</StatNumber>
          <StatLabel>최근 알림</StatLabel>
        </StatCard>
      </StatsGrid>
      
      <QuickActions>
        <QuickActionsTitle>빠른 메뉴</QuickActionsTitle>
        <ActionGrid>
          <ActionButton>
            <ActionTitle>심사 대기 목록</ActionTitle>
            <ActionDesc>대기중인 심사 건 확인</ActionDesc>
          </ActionButton>
          <ActionButton>
            <ActionTitle>심사 진행</ActionTitle>
            <ActionDesc>진행중인 심사 관리</ActionDesc>
          </ActionButton>
          <ActionButton>
            <ActionTitle>의견서 작성</ActionTitle>
            <ActionDesc>심사 의견서 작성</ActionDesc>
          </ActionButton>
          <ActionButton>
            <ActionTitle>현황 조회</ActionTitle>
            <ActionDesc>심사 현황 및 통계</ActionDesc>
          </ActionButton>
        </ActionGrid>
      </QuickActions>
    </DashboardContainer>
  );
}

export default ExaminerDashboard;