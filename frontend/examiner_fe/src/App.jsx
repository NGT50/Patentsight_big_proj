import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import styled from 'styled-components';

// 공통 레이아웃 컴포넌트
import Navigation from './components/Navigation';
import Footer from './components/Footer';

// 페이지 컴포넌트
import ExaminerLogin from './pages/ExaminerLogin';
import ExaminerAuth from './pages/ExaminerAuth';
import ExaminerSignup from './pages/ExaminerSignup';
import ExaminerMyPage from './pages/ExaminerMyPage';
import TermsAgreement from './pages/TermsAgreement';
import PrivacyPolicy from './pages/PrivacyPolicy';
import PatentReview from './pages/PatentReview';
import DesignReview from './pages/DesignReview';
import PatentDashboard from './pages/PatentDashboard';
import DesignDashboard from './pages/DesignDashboard';
import LandingPage from './pages/LandingPage';

// ----- styled-components: 레이아웃 스타일 정의 -----
const AppContainer = styled.div`
  min-height: 100vh; /* 화면 전체 높이 채우기 */
  display: flex;
  flex-direction: column;
  width: 100vw;
  overflow-x: hidden; /* 가로 스크롤 방지 */
`;

const MainContent = styled.main`
  flex: 1; /* 푸터 제외 영역 채우기 */
  padding: 20px;
  background-color: #f5f5f5;
  width: 100%;
  
  /* 반응형 패딩 조정 */
  @media (max-width: 768px) {
    padding: 15px;
  }
  
  @media (max-width: 480px) {
    padding: 10px;
  }
`;

// ----- 메인 App 컴포넌트 -----
function App() {
  // 로그인 상태 저장 (페이지 새로고침 시 localStorage 값 불러옴)
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
  });

  // 로그인한 사용자 정보 저장 (localStorage 동기화)
  const [userInfo, setUserInfo] = useState(() => {
    const savedUserInfo = localStorage.getItem('userInfo');
    return savedUserInfo ? JSON.parse(savedUserInfo) : null;
  });

  // 로그인 성공 처리
  const handleLoginSuccess = (userData) => {
    setIsLoggedIn(true);
    setUserInfo(userData);
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userInfo', JSON.stringify(userData));
  };

  // 로그아웃 처리
  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserInfo(null);
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  // 창 닫기/새로고침 시 자동 로그아웃 처리
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isLoggedIn) {
        // 로그인 상태일 때만 세션 데이터 삭제
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userInfo');
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    };

    // beforeunload 이벤트 리스너 등록
    window.addEventListener('beforeunload', handleBeforeUnload);

    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isLoggedIn]);

  // ----- 렌더링 -----
  return (
    <AppContainer>
      {/* 네비게이션 바 */}
      <Navigation
        isLoggedIn={isLoggedIn}
        userInfo={userInfo} // 사용자 정보 전달
        onLoginSuccess={handleLoginSuccess}
        onLogout={handleLogout}
      />

      {/* 메인 콘텐츠 영역 */}
      <MainContent>
        <Routes>
          {/* 기본 경로 → 랜딩 페이지 */}
          <Route path="/" element={<LandingPage />} />

          {/* 로그인/회원가입/인증 관련 */}
          <Route path="/login" element={<ExaminerLogin onLoginSuccess={handleLoginSuccess} />} />
          <Route path="/auth" element={<ExaminerAuth />} />
          <Route path="/signup" element={<ExaminerSignup />} />

          {/* 마이페이지 */}
          <Route path="/mypage" element={<ExaminerMyPage userInfo={userInfo} />} />

          {/* 정책/약관 */}
          <Route path="/terms" element={<TermsAgreement />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />

          {/* 심사 기능 */}
          <Route path="/patentreview/:id" element={<PatentReview />} />
          <Route path="/designreview/:id" element={<DesignReview />} />
          <Route path="/patent-dashboard" element={<PatentDashboard />} />
          <Route path="/design-dashboard" element={<DesignDashboard />} />
        </Routes>
      </MainContent>

      {/* 푸터 */}
      <Footer />
    </AppContainer>
  );
}

export default App;
