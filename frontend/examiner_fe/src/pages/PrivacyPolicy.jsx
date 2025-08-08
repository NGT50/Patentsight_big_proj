import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const PageContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 40px 20px;
  background: white;
  min-height: 100vh;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 40px;
  padding-bottom: 20px;
  border-bottom: 2px solid #0066cc;
`;

const Title = styled.h1`
  color: #0066cc;
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 10px;
`;

const Subtitle = styled.p`
  color: #666;
  font-size: 16px;
  margin: 0;
`;

const Content = styled.div`
  line-height: 1.8;
  color: #333;
  
  h2 {
    color: #0066cc;
    font-size: 24px;
    font-weight: 600;
    margin: 40px 0 20px 0;
    padding-bottom: 10px;
    border-bottom: 1px solid #eee;
  }
  
  h3 {
    color: #0066cc;
    font-size: 20px;
    font-weight: 600;
    margin: 30px 0 15px 0;
  }
  
  p {
    margin-bottom: 15px;
    font-size: 16px;
  }
  
  ul, ol {
    margin: 15px 0;
    padding-left: 25px;
    
    li {
      margin-bottom: 8px;
      font-size: 16px;
    }
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
  font-size: 14px;
  
  th, td {
    border: 1px solid #ddd;
    padding: 12px 8px;
    text-align: left;
    vertical-align: top;
  }
  
  th {
    background-color: #f8f9fa;
    font-weight: 600;
    color: #333;
  }
  
  td {
    background-color: white;
  }
`;

const BackButton = styled.button`
  background: #0066cc;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  margin-bottom: 30px;
  transition: background-color 0.3s ease;
  
  &:hover {
    background: #0052a3;
  }
`;

const Section = styled.div`
  margin-bottom: 40px;
`;

const Link = styled.a`
  color: #0066cc;
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
`;

function PrivacyPolicy() {
  const navigate = useNavigate();

  useEffect(() => {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: 'smooth' // 부드러운 스크롤
  });
}, []);

  return (
    <PageContainer>
      <BackButton onClick={() => navigate(-1)}>
        ← 이전 페이지로 돌아가기
      </BackButton>
      
      <Header>
        <Title>개인정보처리방침</Title>
        <Subtitle>특허청 개인정보처리방침 (2020. 4. 1. 적용)</Subtitle>
      </Header>
      
      <Content>
        <Section>
          <p>
            특허청은 「개인정보 보호법」 제30조에 따라 정보주체의 개인정보 및 권익을 보호하고 
            개인정보와 관련한 고충을 원활하게 처리할 수 있도록 다음과 같은 개인정보 처리방침을 운영하고 있습니다.
          </p>
        </Section>

        <Section>
          <h2>제1조(개인정보의 처리목적)</h2>
          <p>
            ① 특허청은 다음의 목적을 위하여 최소한의 개인정보를 수집하여 처리합니다. 
            처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 
            이용 목적이 변경되는 경우에는 정보주체의 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
          </p>
          <ul>
            <li>출원, 심사, 등록, 심판 등 지식재산 행정 업무</li>
            <li>민원 접수, 처리 결과 통보 등 민원 사무 처리</li>
            <li>정책 안내, 만족도 조사 등 행정 서비스 제공</li>
          </ul>
        </Section>

        <Section>
          <h2>제2조(개인정보의 처리 및 보유 기간)</h2>
          <p>
            ① 특허청은 법령에 따른 개인정보 보유기간 또는 정보주체로부터 개인정보 수집 시에 
            동의 받은 보유기간 내에서 개인정보를 처리하고 보유합니다.
          </p>
          <p>② 특허청에서 처리하는 개인정보의 내용 및 보유기간은 다음과 같습니다.</p>
          
          <h3>개인정보의 내용 및 보유기간</h3>
          <Table>
            <thead>
              <tr>
                <th>개인정보파일명</th>
                <th>운영목적</th>
                <th>운영근거(수집근거)</th>
                <th>수집항목</th>
                <th>보유기간</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>출원인 정보</td>
                <td>출원인 정보 관리</td>
                <td>특허법 제28조의2, 실용신안법 제3조, 디자인보호법 제29조, 상표법 제29조</td>
                <td>(필수) 성명, 주소, 주민등록번호, 전화번호, 인감, (선택) 휴대전화번호, 이메일</td>
                <td>영구</td>
              </tr>
              <tr>
                <td>변리사 등록 정보</td>
                <td>변리사 등록 및 관리</td>
                <td>변리사법 제5조</td>
                <td>(필수) 성명, 주소, 주민등록번호, 전화번호, 인감, (선택) 휴대전화, 이메일</td>
                <td>영구</td>
              </tr>
              <tr>
                <td>고객상담센터 상담이력</td>
                <td>상담서비스 품질 개선</td>
                <td>정보주체의 동의</td>
                <td>(필수) 성명, 전화번호, 상담정보</td>
                <td>3년</td>
              </tr>
              <tr>
                <td>키프리스 회원 정보</td>
                <td>특허정보검색 서비스 제공</td>
                <td>정보주체의 동의</td>
                <td>(필수) 이메일</td>
                <td>탈퇴 시 까지</td>
              </tr>
            </tbody>
          </Table>
          
          <p>
            ※ 상세한 특허청의 개인정보파일 등록사항 공개는 행정안전부 
            <Link href="https://www.privacy.go.kr" target="_blank" rel="noopener noreferrer">
              '개인정보보호 종합지원 포털(www.privacy.go.kr) → 개인정보민원 → 개인정보열람 등 요구 → 개인정보파일 목록 검색'
            </Link> 
            메뉴를 활용해 주시기 바랍니다.
          </p>
        </Section>

        <Section>
          <h2>제3조(개인정보의 제3자 제공)</h2>
          <p>
            ① 특허청은 정보주체의 개인정보를 처리 목적으로 명시한 범위를 초과하여 제3자에게 제공하지 않습니다. 
            다만, 다음 각 호의 경우에는 제3자에게 제공할 수 있습니다.
          </p>
          <ol>
            <li>정보주체로부터 별도의 동의를 받은 경우</li>
            <li>다른 법률에 특별한 규정이 있는 경우</li>
            <li>정보주체 또는 그 법정대리인이 의사표시를 할 수 없는 상태에 있거나 주소불명 등으로 사전 동의를 받을 수 없는 경우로서 명백히 정보주체 또는 제3자의 급박한 생명, 신체, 재산의 이익을 위하여 필요하다고 인정되는 경우</li>
            <li>개인정보를 목적 외의 용도로 이용하거나 이를 제3자에게 제공하지 아니하면 다른 법률에서 정하는 소관 업무를 수행할 수 없는 경우로서 보호위원회의 심의ㆍ의결을 거친 경우</li>
            <li>조약, 그 밖의 국제협정의 이행을 위하여 외국정부 또는 국제기구에 제공하기 위하여 필요한 경우</li>
            <li>범죄의 수사와 공소의 제기 및 유지를 위하여 필요한 경우</li>
            <li>법원의 재판업무 수행을 위하여 필요한 경우</li>
            <li>형(刑) 및 감호, 보호처분의 집행을 위하여 필요한 경우</li>
          </ol>
        </Section>

        <Section>
          <h2>제4조(개인정보 처리의 위탁)</h2>
          <p>① 특허청은 소관업무처리를 위하여 다음과 같이 개인정보 처리업무를 위탁하고 있습니다.</p>
          
          <h3>개인정보 처리업무를 위탁</h3>
          <Table>
            <thead>
              <tr>
                <th>위탁사업명 및 처리업무의 내용</th>
                <th>수탁기관</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <strong>특허고객상담센터 운영</strong><br/>
                  출원ㆍ등록ㆍ심판 등 지식재산에 관한 상담
                </td>
                <td>
                  - 수탁기관 : 한국특허정보원<br/>
                  - 주 소 : 대전 서구 둔산서로 137, 5층<br/>
                  - 전화번호 : 1544-8080
                </td>
              </tr>
              <tr>
                <td>
                  <strong>특허정보시스템 구축 및 운영</strong><br/>
                  특허넷 응용ㆍ기반시스템 운영 및 관리
                </td>
                <td>
                  - 수탁기관 : 한국특허정보원<br/>
                  - 주 소 : 서울 강남구 테헤란로 131, 7층<br/>
                  - 전화번호 : 02-6915-1400
                </td>
              </tr>
            </tbody>
          </Table>
        </Section>

        <Section>
          <h2>제5조(정보주체와 법정대리인의 권리·의무 및 행사방법)</h2>
          <p>
            ① 정보주체(만14세 미만의 경우에는 법정대리인을 말함)는 다음의 권리를 행사할 수 있습니다.
          </p>
          <ul>
            <li>개인정보 열람요구</li>
            <li>개인정보 정정·삭제 요구</li>
            <li>개인정보 처리정지 요구</li>
          </ul>
          
          <p>
            ② 특허청에서 보유하고 있는 개인정보에 대하여 「개인정보 보호법」 제35조에 따라 
            자신의 개인정보에 대한 열람을 요구할 수 있습니다.
          </p>
          
          <p>
            ③ 특허청에서 보유하고 있는 개인정보에 대하여 「개인정보 보호법」 제36조에 따라 
            정정ㆍ삭제를 요구할 수 있습니다.
          </p>
          
          <p>
            ④ 특허청에서 보유하고 있는 개인정보에 대하여 「개인정보 보호법」 제37조에 따라 
            처리정지를 요구할 수 있습니다.
          </p>
          
          <p>
            ⑤ 제1항에 따른 정보주체의 권리 행사는 「개인정보 보호법」 시행규칙 별지 제8호 서식에 따라 
            개인정보(열람, 정정·삭제, 처리정리) 요구서를 작성한 후 서면, 전화, 전자우편, 
            모사전송(FAX)을 통하여 하실 수 있으며, 특허청은 요구를 받은 날부터 10일 이내에 조치하도록 하겠습니다.
          </p>
        </Section>

        <Section>
          <h2>제6조(개인정보의 파기)</h2>
          <p>
            ① 특허청은 원칙적으로 개인정보 처리목적이 달성된 경우 또는 보유기간이 경과된 경우에는 
            다음과 같이 해당 개인정보를 파기합니다. 다만, 다른 법률에 따라 보존하여야하는 경우에는 그러하지 않습니다.
          </p>
          <ul>
            <li><strong>파기절차</strong> : 개인정보의 처리목적이 달성된 경우 또는 보유기간이 경과한 개인정보(또는 개인정보파일)는 내부관리계획 및 관련 법령에 따라 파기됩니다.</li>
            <li><strong>파기방법</strong> : 전자적 파일 형태로 기록ㆍ저장된 개인정보는 복원이 불가능한 방법으로 삭제하며, 종이문서에 기록된 개인정보는 소각 또는 파쇄합니다.</li>
          </ul>
        </Section>

        <Section>
          <h2>제7조(개인정보의 안전성 확보조치)</h2>
          <p>
            ① 특허청은 개인정보의 안전성 확보를 위해 다음과 같은 관리적, 기술적 및 물리적 조치를 취하고 있습니다.
          </p>
          <ul>
            <li>개인정보 내부 관리계획의 수립 및 시행</li>
            <li>개인정보취급자 지정을 최소화하고 정기적으로 교육 실시</li>
            <li>개인정보 접근 제한ㆍ통제를 위해서 개인정보처리시스템별 접근권한 권리 기준 수립 및 운영</li>
            <li>개인정보처리시스템에 접속한 기록 보관ㆍ점검</li>
            <li>개인정보의 암호화 저장ㆍ관리</li>
            <li>보안프로그램 설치 및 주기적 점검ㆍ갱신</li>
            <li>전산실, 자료보관실 등 비인가자 출입통제</li>
          </ul>
        </Section>

        <Section>
          <h2>제8조(개인정보 자동 수집 장치의 설치ㆍ운영 및 거부에 관한 사항)</h2>
          <p>
            ① 특허청 홈페이지는 이용자에게 맞춤형 서비스를 제공하기 위해 이용정보를 저장하고 
            불러오는 '쿠키(cookie)'를 사용하며, 해당 정보를 목적 외로 이용하거나 제3자에게 제공하지 않습니다.
          </p>
          <p>
            ② 쿠키는 웹사이트를 운영하는데 이용되는 서버(http)가 이용자의 컴퓨터 브라우저에게 
            보내는 소량의 정보이며 이용자의 PC 내의 하드디스크에 저장되기도 합니다.
          </p>
          <ul>
            <li><strong>쿠키의 사용목적</strong> : 이용자의 접속빈도, 방문시간 등 웹사이트 방문 기록을 파악하여 이용자에게 최적화된 정보를 제공하는데 사용됩니다.</li>
            <li><strong>쿠키의 허용 또는 거부</strong> : 웹브라우저 상단의 '도구 → 인터넷옵션 → 개인정보' 메뉴의 옵션 설정을 통해 쿠키 저장을 거부할 수 있습니다.</li>
          </ul>
          <p>다만, 쿠키 저장을 거부할 경우 맞춤형 서비스 이용에 어려움이 발생할 수 있습니다.</p>
        </Section>

        <Section>
          <h2>제9조(개인정보 보호책임자 및 개인정보 보호담당자)</h2>
          <p>
            ① 특허청은 「개인정보 보호법」 제31조제1항에 따라 개인정보를 보호하고 
            개인정보 처리와 관련한 불만을 처리하기 위하여 아래와 같이 개인정보 보호책임자 및 담당자를 지정하고 있습니다.
          </p>
          
          <h3>개인정보 보호책임자 및 담당자</h3>
          <Table>
            <thead>
              <tr>
                <th>구분</th>
                <th>담당자</th>
                <th>연락처</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>개인정보 보호책임자</td>
                <td>정보고객지원국장 박종주</td>
                <td>
                  - 전화: 042-481-5118<br/>
                  - 주소: 대전 서구 청사로189 정부대전청사16층<br/>
                  - FAX : 042-472-2460<br/>
                  - E-Mail : equalcircuit@korea.kr
                </td>
              </tr>
              <tr>
                <td>개인정보 보호담당자</td>
                <td>정보고객정책과 이상윤</td>
                <td>-</td>
              </tr>
              <tr>
                <td>개인정보 보호담당자</td>
                <td>정보고객정책과 정준기</td>
                <td>-</td>
              </tr>
            </tbody>
          </Table>
        </Section>

        <Section>
          <h2>제10조(개인정보 열람청구를 접수·처리하는 부서)</h2>
          <p>① 정보주체는 제5조에서 규정하고 있는 권리를 다음과 같은 부서에 청구할 수 있습니다.</p>
          
          <h3>개인정보 열람청구를 접수·처리하는 부서</h3>
          <Table>
            <thead>
              <tr>
                <th>부서</th>
                <th>담당자</th>
                <th>연락처</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>정보고객정책과</td>
                <td>정준기</td>
                <td>
                  - 전화: 042-481-5118<br/>
                  - 주소: 대전 서구 청사로189 정부대전청사16층<br/>
                  - FAX : 042-472-2460<br/>
                  - E-Mail : equalcircuit@korea.kr
                </td>
              </tr>
            </tbody>
          </Table>
          
          <p>
            ② 제1항의 열람청구 부서 이외에, 행정안전부 
            <Link href="https://www.privacy.go.kr" target="_blank" rel="noopener noreferrer">
              '개인정보보호 종합지원 포털'
            </Link>을 통해 다음과 같이 개인정보 열람청구를 할 수 있습니다.
          </p>
          <p>
            ※ 청구절차 : 행정안전부 개인정보보호 종합지원 포털(www.privacy.go.kr → 개인정보 민원 → 개인정보 열람 등 요구 (I-PIN을 통한 본인인증 필요)
          </p>
        </Section>

        <Section>
          <h2>제11조(권익침해 구제방법)</h2>
          <p>정보주체는 다음 각 호의 기관에 대해 개인정보 침해에 대한 피해구제, 상담 등을 문의하실 수 있습니다.</p>
          
          <h3>개인정보 분쟁조정위원회</h3>
          <ul>
            <li>가. 소관업무 : 개인정보 분쟁조정신청, 집단분쟁조정</li>
            <li>나. 홈페이지 : <Link href="https://www.kopico.go.kr" target="_blank" rel="noopener noreferrer">www.kopico.go.kr</Link></li>
            <li>다. 전화 : (국번없이)1833-6972</li>
            <li>라. 주소 : (03171) 서울특별시 종로구 세종대로 209 정부서울청사 4층</li>
          </ul>
          
          <h3>개인정보 침해신고센터 (한국인터넷진흥원 운영)</h3>
          <ul>
            <li>가. 소관업무 : 개인정보 침해사실 신고, 상담 신청</li>
            <li>나. 홈페이지 : <Link href="https://privacy.kisa.or.kr" target="_blank" rel="noopener noreferrer">privacy.kisa.or.kr</Link></li>
            <li>다. 전화 : (국번없이) 118</li>
          </ul>
          
          <ul>
            <li>대검찰청 사이버수사과 : (국번없이) 1301 (<Link href="https://www.spo.go.kr" target="_blank" rel="noopener noreferrer">www.spo.go.kr</Link>)</li>
            <li>경찰청 사이버안전지킴이 : (국번없이) 182 (<Link href="http://www.police.go.kr/www/security/cyber.jsp" target="_blank" rel="noopener noreferrer">http://www.police.go.kr/www/security/cyber.jsp</Link>)</li>
          </ul>
        </Section>

        <Section>
          <h2>제12조(영상정보처리기기 설치·운영)</h2>
          <p>
            특허청은 다음과 같이 영상정보처리기기 운영·관리 방침을 정하여 운영하고 있습니다. 
            특허청에서 설치·운영 중인 영상정보처리기기는 다음과 같습니다.
          </p>
          <p>
            <Link href="#" onClick={(e) => { e.preventDefault(); alert('영상정보처리기기 운영·관리 방침 페이지로 이동'); }}>
              특허청 영상정보처리기기 운영·관리 방침 보기
            </Link>
          </p>
        </Section>

        <Section>
          <h2>제13조(개인정보처리방침 변경)</h2>
          <p>이 개인정보처리방침은 2020. 4. 1. 부터 적용됩니다.</p>
          <p>이전의 개인정보처리방침은 아래에서 확인하실 수 있습니다.</p>
          <ul>
            <li><Link href="#" onClick={(e) => { e.preventDefault(); alert('2019. 06. 28 ~ 2020. 03. 31 적용 버전'); }}>2019. 06. 28 ~ 2020. 03. 31 적용 (클릭)</Link></li>
            <li><Link href="#" onClick={(e) => { e.preventDefault(); alert('2018. 06. 29 ~ 2019. 06. 27 적용 버전'); }}>2018. 06. 29 ~ 2019. 06. 27 적용 (클릭)</Link></li>
            <li><Link href="#" onClick={(e) => { e.preventDefault(); alert('2017. 05. 29 ~ 2018. 06. 28 적용 버전'); }}>2017. 05. 29 ~ 2018. 06. 28 적용 (클릭)</Link></li>
            <li><Link href="#" onClick={(e) => { e.preventDefault(); alert('2017. 02. 15 ~ 2017. 05. 28 적용 버전'); }}>2017. 02. 15 ~ 2017. 05. 28 적용 (클릭)</Link></li>
            <li><Link href="#" onClick={(e) => { e.preventDefault(); alert('2016. 06. 30 ~ 2017. 02. 14 적용 버전'); }}>2016. 06. 30 ~ 2017. 02. 14 적용 (클릭)</Link></li>
            <li><Link href="#" onClick={(e) => { e.preventDefault(); alert('2015. 07. 22 ~ 2016. 06. 29 적용 버전'); }}>2015. 07. 22 ~ 2016. 06. 29 적용 (클릭)</Link></li>
            <li><Link href="#" onClick={(e) => { e.preventDefault(); alert('2015. 05. 08 ~ 2015. 07. 21 적용 버전'); }}>2015. 05. 08 ~ 2015. 07. 21 적용 (클릭)</Link></li>
            <li><Link href="#" onClick={(e) => { e.preventDefault(); alert('2014. 10. 24 ~ 2015. 05. 07 적용 버전'); }}>2014. 10. 24 ~ 2015. 05. 07 적용 (클릭)</Link></li>
            <li><Link href="#" onClick={(e) => { e.preventDefault(); alert('2014. 01. 01 ~ 2014. 10. 23 적용 버전'); }}>2014. 01. 01 ~ 2014. 10. 23 적용 (클릭)</Link></li>
            <li><Link href="#" onClick={(e) => { e.preventDefault(); alert('2012. 08. 01 ~ 2013. 12. 31 적용 버전'); }}>2012. 08. 01 ~ 2013. 12. 31 적용 (클릭)</Link></li>
            <li><Link href="#" onClick={(e) => { e.preventDefault(); alert('2012. 02. 29 ~ 2012. 07. 31 적용 버전'); }}>2012. 02. 29 ~ 2012. 07. 31 적용 (클릭)</Link></li>
          </ul>
        </Section>
      </Content>
    </PageContainer>
  );
}

export default PrivacyPolicy;