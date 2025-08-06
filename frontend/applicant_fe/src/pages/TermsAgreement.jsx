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

const AllAgreeSection = styled.div`
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  @media (max-width: 768px) {
    padding: 15px;
    margin-bottom: 25px;
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }
`;

const AllAgreeText = styled.div`
  flex: 1;
  
  p {
    margin: 0 0 8px 0;
    font-size: 14px;
    color: #333;
    line-height: 1.5;
    
    &:last-child {
      margin-bottom: 0;
      font-size: 12px;
      color: #666;
    }
  }
  
  @media (max-width: 768px) {
    p {
      font-size: 13px;
      
      &:last-child {
        font-size: 11px;
      }
    }
  }
`;

const AllAgreeCheckbox = styled.label`
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
  color: #0066cc;
  cursor: pointer;
  
  input[type="checkbox"] {
    width: 20px;
    height: 20px;
  }
  
  @media (max-width: 768px) {
    font-size: 14px;
    
    input[type="checkbox"] {
      width: 18px;
      height: 18px;
    }
  }
`;

const TermsSection = styled.div`
  margin-bottom: 30px;
  
  @media (max-width: 768px) {
    margin-bottom: 25px;
  }
`;

const TermsTitle = styled.h3`
  display: flex;
  align-items: center;
  gap: 10px;
  color: #0066cc;
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 15px;
  
  &::before {
    content: '';
    width: 8px;
    height: 8px;
    background: #0066cc;
    border-radius: 50%;
  }
  
  @media (max-width: 768px) {
    font-size: 16px;
    margin-bottom: 12px;
  }
`;

const TermsContent = styled.div`
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 15px;
  max-height: 200px;
  overflow-y: auto;
  font-size: 13px;
  line-height: 1.6;
  color: #333;
  
  @media (max-width: 768px) {
    padding: 15px;
    max-height: 150px;
    font-size: 12px;
  }
`;

const RadioGroup = styled.div`
  display: flex;
  gap: 20px;
  align-items: center;
  
  @media (max-width: 768px) {
    gap: 15px;
  }
`;

const RadioItem = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  
  input[type="radio"] {
    width: 16px;
    height: 16px;
  }
  
  @media (max-width: 768px) {
    font-size: 13px;
    
    input[type="radio"] {
      width: 14px;
      height: 14px;
    }
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  margin-top: 30px;
  
  @media (max-width: 768px) {
    gap: 12px;
    margin-top: 25px;
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
    
    &:disabled {
      background: #ccc;
      cursor: not-allowed;
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

function TermsAgreement() {
  const navigate = useNavigate();
  const [agreements, setAgreements] = useState({
    allAgree: false,
    termsAgree: false,
    privacyAgree: false
  });

  const handleAllAgree = (checked) => {
    setAgreements({
      allAgree: checked,
      termsAgree: checked,
      privacyAgree: checked
    });
  };

  const handleIndividualAgree = (name, value) => {
    const newAgreements = {
      ...agreements,
      [name]: value
    };
    
    // 모든 개별 동의가 체크되었는지 확인
    const allChecked = newAgreements.termsAgree && newAgreements.privacyAgree;
    
    setAgreements({
      ...newAgreements,
      allAgree: allChecked
    });
  };

  const handleNext = () => {
    if (agreements.termsAgree && agreements.privacyAgree) {
      navigate('/signup', { state: { fromTerms: true } });
    } else {
      alert('필수 약관에 모두 동의해주세요.');
    }
  };

  const handleCancel = () => {
    navigate('/login');
  };

  useEffect(() => {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: 'smooth' // 부드러운 스크롤
  });
}, []);


  return (
    <PageContainer>
      <ProgressContainer>
        <ProgressBar>
          <ProgressStep>
            <StepCircle active={true}>✓</StepCircle>
            <StepLabel active={true}>약관동의</StepLabel>
          </ProgressStep>
          <ProgressLine />
          <ProgressStep>
            <StepCircle active={false}>2</StepCircle>
            <StepLabel active={false}>기본정보 입력</StepLabel>
          </ProgressStep>
          <ProgressLine />
          <ProgressStep>
            <StepCircle active={false}>3</StepCircle>
            <StepLabel active={false}>가입완료</StepLabel>
          </ProgressStep>
        </ProgressBar>
      </ProgressContainer>

      <Title>회원가입</Title>

      <AllAgreeSection>
        <AllAgreeText>
          <p>PATENTSIGHT 이용약관, 개인정보의 수집 및 이용 항목에 대해 모두 동의합니다.</p>
          <p>각 사항에 대한 동의 여부를 개별적으로 선택하실 수 있으며, 선택 동의 사항에 대한 동의를 거부하여도 서비스를 이용하실 수 있습니다.</p>
        </AllAgreeText>
        <AllAgreeCheckbox>
          <input
            type="checkbox"
            checked={agreements.allAgree}
            onChange={(e) => handleAllAgree(e.target.checked)}
          />
          <span>모두 동의합니다.</span>
        </AllAgreeCheckbox>
      </AllAgreeSection>

      <TermsSection>
        <TermsTitle>PATENTSIGHT 이용약관</TermsTitle>
        <TermsContent>
          <strong>제1조 (목적)</strong><br/>
          이 약관은 특허청(이하 "청"이라 한다)이 제공하는 특허정보검색서비스(KIPRIS)의 이용과 관련하여 청과 이용자 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.<br/><br/>
          
          <strong>제2조 (이용자의 정의)</strong><br/>
          "이용자"라 함은 이 약관에 따라 청이 제공하는 서비스를 받는 자를 말합니다.<br/><br/>
          
          <strong>제3조 (약관의 효력과 변경)</strong><br/>
          1. 이 약관은 서비스 화면에 게시하거나 기타의 방법으로 이용자에게 공지함으로써 효력이 발생합니다.<br/>
          2. 청은 필요한 경우 관련법령을 위배하지 않는 범위에서 이 약관을 변경할 수 있습니다.
        </TermsContent>
        <div>
          <p style={{ fontSize: '14px', marginBottom: '10px' }}>[필수] PATENTSIGHT 이용약관을 읽고 동의합니다.</p>
          <RadioGroup>
            <RadioItem>
              <input
                type="radio"
                name="termsAgree"
                value="disagree"
                checked={!agreements.termsAgree}
                onChange={() => handleIndividualAgree('termsAgree', false)}
              />
              <span>동의안함</span>
            </RadioItem>
            <RadioItem>
              <input
                type="radio"
                name="termsAgree"
                value="agree"
                checked={agreements.termsAgree}
                onChange={() => handleIndividualAgree('termsAgree', true)}
              />
              <span>동의함</span>
            </RadioItem>
          </RadioGroup>
        </div>
      </TermsSection>

      <TermsSection>
        <TermsTitle>개인정보 수집 및 처리에 관한 사항</TermsTitle>
        <TermsContent>
          <strong>개인정보의 수집목적 및 이용목적</strong><br/>
          회원가입 및 서비스 이용을 위해 다음과 같은 개인정보를 수집합니다.<br/><br/>
          
          <strong>수집항목:</strong> 이메일, 비밀번호<br/>
          <strong>이용목적:</strong> 본인확인, 서비스 이용<br/><br/>
          
          <strong>개인정보의 수집범위</strong><br/>
          회원가입, 설문조사, 이벤트, 교육신청 등 서비스 이용에 필요한 최소한의 정보만을 수집하며, 선택항목에 대한 동의를 거부하더라도 서비스 이용에 제한을 두지 않습니다.<br/>
          보유기간: 이용자 동의 철회 시까지 (개인정보보호법 제15조)
        </TermsContent>
        <div>
          <p style={{ fontSize: '14px', marginBottom: '10px' }}>[필수] 개인정보 수집 및 처리에 동의합니다.</p>
          <RadioGroup>
            <RadioItem>
              <input
                type="radio"
                name="privacyAgree"
                value="disagree"
                checked={!agreements.privacyAgree}
                onChange={() => handleIndividualAgree('privacyAgree', false)}
              />
              <span>동의안함</span>
            </RadioItem>
            <RadioItem>
              <input
                type="radio"
                name="privacyAgree"
                value="agree"
                checked={agreements.privacyAgree}
                onChange={() => handleIndividualAgree('privacyAgree', true)}
              />
              <span>동의함</span>
            </RadioItem>
          </RadioGroup>
        </div>
      </TermsSection>

      <ButtonGroup>
        <Button type="button" className="secondary" onClick={handleCancel}>
          취소
        </Button>
        <Button 
          type="button" 
          className="primary" 
          onClick={handleNext}
          disabled={!agreements.termsAgree || !agreements.privacyAgree}
        >
          다음단계
        </Button>
      </ButtonGroup>
    </PageContainer>
  );
}

export default TermsAgreement;