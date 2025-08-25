import React from 'react';
import styled from 'styled-components';

const AdminContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  width: 100%;
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

const AdminGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 15px;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 10px;
  }
`;

const AdminCard = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  
  @media (max-width: 768px) {
    padding: 15px;
  }
  
  @media (max-width: 480px) {
    padding: 12px;
  }
`;

const CardTitle = styled.h3`
  color: #333;
  margin-bottom: 15px;
  font-size: 18px;
  font-weight: 600;
  
  @media (max-width: 768px) {
    font-size: 16px;
    margin-bottom: 12px;
  }
  
  @media (max-width: 480px) {
    font-size: 14px;
    margin-bottom: 10px;
  }
`;

const AdminButton = styled.button`
  background: #0066cc;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  margin: 5px;
  font-size: 14px;
  transition: all 0.3s ease;
  
  &:hover {
    background: #0052a3;
  }
  
  @media (max-width: 768px) {
    padding: 8px 16px;
    font-size: 13px;
    margin: 3px;
  }
  
  @media (max-width: 480px) {
    padding: 6px 12px;
    font-size: 12px;
    margin: 2px;
    width: calc(50% - 4px);
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  
  @media (max-width: 480px) {
    gap: 4px;
  }
`;

function ApplicantAdmin() {
  return (
    <AdminContainer>
      <Title>출원인 관리 페이지</Title>
      
      <AdminGrid>
        <AdminCard>
          <CardTitle>사용자 관리</CardTitle>
          <ButtonContainer>
            <AdminButton>사용자 목록</AdminButton>
            <AdminButton>권한 관리</AdminButton>
            <AdminButton>계정 설정</AdminButton>
          </ButtonContainer>
        </AdminCard>
        
        <AdminCard>
          <CardTitle>시스템 관리</CardTitle>
          <ButtonContainer>
            <AdminButton>시스템 설정</AdminButton>
            <AdminButton>로그 확인</AdminButton>
            <AdminButton>백업 관리</AdminButton>
          </ButtonContainer>
        </AdminCard>
        
        <AdminCard>
          <CardTitle>데이터 관리</CardTitle>
          <ButtonContainer>
            <AdminButton>데이터 백업</AdminButton>
            <AdminButton>데이터 복원</AdminButton>
            <AdminButton>데이터 정리</AdminButton>
          </ButtonContainer>
        </AdminCard>
      </AdminGrid>
    </AdminContainer>
  );
}

export default ApplicantAdmin;