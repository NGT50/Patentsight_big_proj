import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const FooterContainer = styled.footer`
  background: #333;
  color: white;
  padding: 6px 20px;
  margin-top: auto;
  width: 100%;
  box-sizing: border-box;
  
  @media (max-width: 768px) {
    padding:4px 15px;
  }
  
  @media (max-width: 480px) {
    padding: 2px 10px;
  }
`;

const FooterContent = styled.div`
  width: 100%;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  
  @media (max-width: 768px) {
    gap: 15px;
  }
  
  @media (max-width: 480px) {
    
    gap: 10px;
  }
`;

const FooterSection = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  
  @media (max-width: 768px) {
    gap: 10px;
  }
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
  margin-top: 15px;
  padding-top: 10px;
  border-top: 1px solid #555;
  color: #999;
  font-size: 12px;
  
  @media (max-width: 768px) {
    margin-top: 10px;
    padding-top: 7px;
    font-size: 11px;
  }
  
  @media (max-width: 480px) {
    margin-top: 8px;
    padding-top: 6px;
    font-size: 10px;
  }
`;

// 법적 메뉴 스타일
const LegalMenuContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    gap: 15px;
    
  }
  
  @media (max-width: 480px) {
    gap: 10px;
    
  }
`;

const LegalMenuItem = styled.button`
  background: none;
  border: none;
  color: ${props => props.$active ? '#ffa500' : '#ccc'};
  font-size: 14px;
  cursor: pointer;
  padding: 5px 10px;
  transition: color 0.3s ease;
  
  &:hover {
    color: #ffa500;
  }
  
  @media (max-width: 768px) {
    font-size: 13px;
    padding: 4px 8px;
  }
  
  @media (max-width: 480px) {
    font-size: 12px;
    padding: 3px 6px;
  }
`;

const DotSeparator = styled.span`
  color: #666;
  font-size: 12px;
  
  @media (max-width: 480px) {
    font-size: 10px;
  }
`;

// 팝업 스타일
const PopupOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
  
  @media (max-width: 768px) {
    padding: 10px;
  }
`;

const PopupContainer = styled.div`
  background: white;
  border-radius: 8px;
  max-width: 800px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
  
  @media (max-width: 768px) {
    max-height: 90vh;
  }
`;

const PopupHeader = styled.div`
  background: #0066cc;
  color: white;
  padding: 20px;
  border-radius: 8px 8px 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  @media (max-width: 768px) {
    padding: 15px;
  }
`;

const PopupTitle = styled.h2`
  margin: 0;
  font-size: 18px;
  
  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
  }
`;

const PopupContent = styled.div`
  padding: 30px;
  color: #333;
  line-height: 1.8;
  
  @media (max-width: 768px) {
    padding: 20px;
  }
  
  @media (max-width: 480px) {
    padding: 15px;
  }
`;

const PopupSection = styled.div`
  margin-bottom: 25px;
  
  h3 {
    color: #0066cc;
    margin-bottom: 15px;
    font-size: 16px;
  }
  
  p {
    margin-bottom: 10px;
    font-size: 14px;
  }
  
  ul {
    margin: 10px 0;
    padding-left: 20px;
  }
  
  li {
    margin-bottom: 5px;
    font-size: 14px;
  }
  
  @media (max-width: 768px) {
    margin-bottom: 20px;
    
    h3 {
      font-size: 15px;
      margin-bottom: 12px;
    }
    
    p, li {
      font-size: 13px;
    }
  }
`;

// 특허청 로고 스타일
const LogoSection = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    gap: 10px;
    margin-bottom: 15px;
  }
`;

const Logo = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #ef4444 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  
  &::before {
    content: '';
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: white;
    position: absolute;
  }
  
  &::after {
    content: '';
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: linear-gradient(135deg, #ef4444 0%, #3b82f6 100%);
    position: absolute;
  }
  
  @media (max-width: 768px) {
    width: 40px;
    height: 40px;
    
    &::before {
      width: 24px;
      height: 24px;
    }
    
    &::after {
      width: 16px;
      height: 16px;
    }
  }
`;

const LogoText = styled.h2`
  color: #ccc;
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  white-space: nowrap;
  
  @media (max-width: 768px) {
    font-size: 18px;
  }
  
  @media (max-width: 480px) {
    font-size: 16px;
  }
`;

const ContactInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  
  @media (max-width: 768px) {
    gap: 6px;
  }
`;

const ContactLine = styled.div`
  color: #ccc;
  font-size: 14px;
  
  .highlight {
    color: #3b82f6;
  }
  
  @media (max-width: 768px) {
    font-size: 13px;
  }
  
  @media (max-width: 480px) {
    font-size: 12px;
  }
`;

function Footer() {
  const navigate = useNavigate();
  const [activePopup, setActivePopup] = useState(null);

  const openPopup = (popupType) => {
    if (popupType === 'privacy') {
      navigate('/privacy-policy');
    } else {
      setActivePopup(popupType);
    }
  };

  const closePopup = () => {
    setActivePopup(null);
  };

  const renderCopyrightPolicy = () => (
    <PopupContent>
      <PopupSection>
        <h3>저작권정책</h3>
        <p>특허청 웹사이트의 모든 콘텐츠는 대한민국 저작권법에 의해 보호됩니다.</p>
      </PopupSection>
      
      <PopupSection>
        <h3>제1조(저작권의 귀속)</h3>
        <p>① 특허청 웹사이트의 모든 콘텐츠에 대한 저작권은 특허청에 귀속됩니다.</p>
        <p>② 특허청이 제공하는 특허정보, 상표정보, 디자인정보 등은 공공정보로서 자유롭게 이용할 수 있습니다.</p>
      </PopupSection>
      
      <PopupSection>
        <h3>제2조(이용허락)</h3>
        <p>① 특허청 웹사이트의 콘텐츠는 개인적 용도나 교육 목적으로 자유롭게 이용할 수 있습니다.</p>
        <p>② 상업적 목적으로 이용하고자 하는 경우에는 사전에 특허청의 허락을 받아야 합니다.</p>
      </PopupSection>
      
      <PopupSection>
        <h3>제3조(금지사항)</h3>
        <p>다음과 같은 행위는 금지됩니다:</p>
        <ul>
          <li>저작권자의 허락 없이 콘텐츠를 복제, 배포, 전송하는 행위</li>
          <li>콘텐츠를 변조하거나 훼손하는 행위</li>
          <li>상업적 목적으로 무단 이용하는 행위</li>
        </ul>
      </PopupSection>
    </PopupContent>
  );

  const renderEmailPolicy = () => (
    <PopupContent>
      <PopupSection>
        <h3>이메일무단수집거부</h3>
        <p>본 웹사이트에 게시된 이메일 주소가 전자우편 수집 프로그램이나 그 밖의 기술적 장치를 이용하여 무단으로 수집되는 것을 거부하며, 이를 위반 시 정보통신망 이용촉진 및 정보보호 등에 관한 법률에 의해 처벌받을 수 있습니다.</p>
      </PopupSection>
      
      <PopupSection>
        <h3>제1조(이메일 수집 금지)</h3>
        <p>① 특허청 웹사이트에 게시된 모든 이메일 주소는 무단 수집을 금지합니다.</p>
        <p>② 전자우편 수집 프로그램이나 그 밖의 기술적 장치를 이용한 이메일 주소 수집은 불법입니다.</p>
      </PopupSection>
      
      <PopupSection>
        <h3>제2조(처벌 규정)</h3>
        <p>정보통신망 이용촉진 및 정보보호 등에 관한 법률 제50조의2에 따라 다음과 같이 처벌됩니다:</p>
        <ul>
          <li>1년 이하의 징역 또는 1천만원 이하의 벌금</li>
          <li>영업정지 또는 과태료 부과</li>
        </ul>
      </PopupSection>
    </PopupContent>
  );

  const renderPatentCharter = () => (
    <PopupContent>
      <PopupSection>
        <h3>특허서비스헌장</h3>
        <p>특허청은 국민에게 양질의 특허서비스를 제공하기 위해 다음과 같은 서비스헌장을 제정하고 실천합니다.</p>
      </PopupSection>
      
      <PopupSection>
        <h3>제1조(서비스 목표)</h3>
        <p>① 창의적 아이디어의 권리화를 통한 국가경쟁력 강화</p>
        <p>② 지식재산권 보호를 통한 혁신 생태계 조성</p>
        <p>③ 국민 편의성 증진을 위한 디지털 전환 가속화</p>
      </PopupSection>
      
      <PopupSection>
        <h3>제2조(서비스 기준)</h3>
        <ul>
          <li>출원심사 기간: 평균 12개월 이내</li>
          <li>심판처리 기간: 평균 18개월 이내</li>
          <li>고객상담 응답: 24시간 이내</li>
          <li>온라인 서비스 가용성: 99.9% 이상</li>
        </ul>
      </PopupSection>
      
      <PopupSection>
        <h3>제3조(서비스 개선)</h3>
        <p>특허청은 지속적인 서비스 개선을 위해 고객의 의견을 적극 수렴하고, 새로운 기술을 도입하여 더 나은 서비스를 제공하겠습니다.</p>
      </PopupSection>
    </PopupContent>
  );

  const renderDirections = () => (
    <PopupContent>
      <PopupSection>
        <h3>찾아오시는 길</h3>
        <p>특허청에 방문하시는 방법을 안내드립니다.</p>
      </PopupSection>
      
      <PopupSection>
        <h3>주소</h3>
        <p>(35208) 대전광역시 서구 청사로 189, 4동(둔산동, 정부대전청사)</p>
      </PopupSection>
      
      <PopupSection>
        <h3>대중교통</h3>
        <h4>지하철</h4>
        <ul>
          <li>대전 1호선 정부청사역 하차</li>
          <li>1번 출구로 나와서 도보 5분</li>
        </ul>
        
        <h4>버스</h4>
        <ul>
          <li>정부청사역 정류장 하차</li>
          <li>간선버스: 101, 102, 103, 104</li>
          <li>지선버스: 501, 502, 503</li>
        </ul>
      </PopupSection>
      
      <PopupSection>
        <h3>자가용</h3>
        <p>정부대전청사 내 주차장 이용 가능 (유료)</p>
        <p>주차요금: 시간당 1,000원</p>
      </PopupSection>
      
      <PopupSection>
        <h3>연락처</h3>
        <p>대표전화: <span className="highlight">1544-8080</span> (유료, 월~금 09:00~18:00)</p>
        <p>전자출원서비스 이용안내: 월~토 00:00~24:00, 일요일 10:00~24:00</p>
      </PopupSection>
    </PopupContent>
  );

  return (
    <FooterContainer>
      <LegalMenuContainer>
        <LegalMenuItem 
          $active={activePopup === 'privacy'} 
          onClick={() => openPopup('privacy')}
        >
          개인정보처리방침
        </LegalMenuItem>
        <DotSeparator>•</DotSeparator>
        <LegalMenuItem 
          $active={activePopup === 'copyright'} 
          onClick={() => openPopup('copyright')}
        >
          저작권정책
        </LegalMenuItem>
        <DotSeparator>•</DotSeparator>
        <LegalMenuItem 
          $active={activePopup === 'email'} 
          onClick={() => openPopup('email')}
        >
          이메일무단수집거부
        </LegalMenuItem>
        <DotSeparator>•</DotSeparator>
        <LegalMenuItem 
          $active={activePopup === 'charter'} 
          onClick={() => openPopup('charter')}
        >
          특허서비스헌장
        </LegalMenuItem>
        <DotSeparator>•</DotSeparator>
        <LegalMenuItem 
          $active={activePopup === 'directions'} 
          onClick={() => openPopup('directions')}
        >
          찾아오시는 길
        </LegalMenuItem>
      </LegalMenuContainer>

      <FooterContent>
        <FooterSection>
          <LogoSection>
            <Logo />
            <LogoText>특허청</LogoText>
          </LogoSection>
          <ContactInfo>
            <ContactLine>
              (35208) 대전광역시 서구 청사로 189, 4동(둔산동, 정부대전청사)
            </ContactLine>
            <ContactLine>
              대표전화 <span className="highlight">1544-8080</span> (유료, 월~금 09:00~18:00) / 전자출원서비스 이용안내 : 월~토 00:00~24:00, 일요일 10:00~24:00
            </ContactLine>
          </ContactInfo>
        </FooterSection>
      </FooterContent>
      
      <Copyright>
        COPYRIGHT (C) Korean Intellectual Property Office. ALL RIGHTS RESERVED.
      </Copyright>

      {/* 팝업들 */}
      {activePopup && (
        <PopupOverlay onClick={closePopup}>
          <PopupContainer onClick={(e) => e.stopPropagation()}>
            <PopupHeader>
              <PopupTitle>
                {activePopup === 'copyright' && '저작권정책'}
                {activePopup === 'email' && '이메일무단수집거부'}
                {activePopup === 'charter' && '특허서비스헌장'}
                {activePopup === 'directions' && '찾아오시는 길'}
              </PopupTitle>
              <CloseButton onClick={closePopup}>×</CloseButton>
            </PopupHeader>
            {activePopup === 'copyright' && renderCopyrightPolicy()}
            {activePopup === 'email' && renderEmailPolicy()}
            {activePopup === 'charter' && renderPatentCharter()}
            {activePopup === 'directions' && renderDirections()}
          </PopupContainer>
        </PopupOverlay>
      )}
    </FooterContainer>
  );
}

export default Footer;