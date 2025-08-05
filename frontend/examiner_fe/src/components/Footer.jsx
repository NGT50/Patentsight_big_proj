import React from 'react';
import styled from 'styled-components';

const FooterContainer = styled.footer`
  background: #333;
  color: white;
  padding: 30px 20px;
  margin-top: auto;
  width: 100%;
  box-sizing: border-box;
  
  @media (max-width: 768px) {
    padding: 20px 15px;
  }
  
  @media (max-width: 480px) {
    padding: 15px 10px;
  }
`;

const FooterContent = styled.div`
  width: 100%;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 15px;
  }
`;

const FooterSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const FooterTitle = styled.h3`
  color: #0066cc;
  margin-bottom: 10px;
  font-size: 16px;
  font-weight: 600;
  
  @media (max-width: 768px) {
    font-size: 14px;
    margin-bottom: 8px;
  }
  
  @media (max-width: 480px) {
    font-size: 13px;
    margin-bottom: 5px;
  }
`;

const FooterText = styled.p`
  color: #ccc;
  font-size: 14px;
  line-height: 1.6;
  
  @media (max-width: 768px) {
    font-size: 13px;
  }
  
  @media (max-width: 480px) {
    font-size: 12px;
  }
`;

const Copyright = styled.div`
  text-align: center;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #555;
  color: #999;
  font-size: 12px;
  
  @media (max-width: 768px) {
    margin-top: 20px;
    padding-top: 15px;
    font-size: 11px;
  }
  
  @media (max-width: 480px) {
    margin-top: 15px;
    padding-top: 10px;
    font-size: 10px;
  }
`;

function Footer() {
  return (
    <FooterContainer>
      <FooterContent>
        <FooterSection>
          <FooterTitle>특허청 특허정보시스템</FooterTitle>
          <FooterText>
            대한민국 특허청에서 제공하는<br />
            특허정보 검색 및 관리 시스템입니다.
          </FooterText>
        </FooterSection>
        
        <FooterSection>
          <FooterTitle>연락처</FooterTitle>
          <FooterText>
            전화: 1544-8080<br />
            팩스: 02-354-0123<br />
            이메일: info@kipo.go.kr
          </FooterText>
        </FooterSection>
        
        <FooterSection>
          <FooterTitle>주소</FooterTitle>
          <FooterText>
            서울특별시 서초구 남부순환로 242<br />
            특허청빌딩 1층
          </FooterText>
        </FooterSection>
      </FooterContent>
      
      <Copyright>
        © 2024 특허청. All rights reserved.
      </Copyright>
    </FooterContainer>
  );
}

export default Footer;