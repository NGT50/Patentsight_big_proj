import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import styled from 'styled-components';
import Navigation from './components/Navigation';
import SubNavigation from './components/SubNavigation';
import Footer from './components/Footer';
import ApplicantSignup from './pages/ApplicantSignup';
import ApplicantSignupComplete from './pages/ApplicantSignupComplete';
import ApplicantLogin from './pages/ApplicantLogin';
import ApplicantAdmin from './pages/ApplicantAdmin';
import TermsAgreement from './pages/TermsAgreement';
import PrivacyPolicy from './pages/PrivacyPolicy';
//지원님 코드
import PatentDetail from './pages/PatentDetail';
import SearchResult from './pages/SearchResult';
import PrivateRoute from './components/PrivateRoute'; // PrivateRoute 컴포넌트 import
import DocumentEditor from './pages/DocumentEditor';
import FinalSubmitPage from './pages/FinalSubmit'; 
import MyPage from "./pages/MyPage";
import LandingPage from './pages/LandingPage';
// (QueryClient import 등 나머지 코드는 동일)
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient();


const AppContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  width: 100%;
  box-sizing: border-box;
`;

const MainContent = styled.main`
  flex: 1;
  padding: 20px;
  background-color: #f5f5f5;
  min-height: calc(100vh - 170px); /* SubNavigation 높이(50px) 추가 */
  
  @media (max-width: 768px) {
    padding: 15px;
    min-height: calc(100vh - 150px); /* SubNavigation 높이(45px) 추가 */
  }
  
  @media (max-width: 480px) {
    padding: 10px;
    min-height: calc(100vh - 140px); /* SubNavigation 높이(45px) 추가 */
  }
`;

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  const handleLoginSuccess = (userData) => {
    setIsLoggedIn(true);
    setUserInfo(userData);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserInfo(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userInfo');
  };

  // 창이 닫힐 때 로그아웃 처리
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isLoggedIn) {
        // 로그인 상태일 때만 로그아웃 처리
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userInfo');
      }
    };

    // beforeunload 이벤트 리스너 추가
    window.addEventListener('beforeunload', handleBeforeUnload);

    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isLoggedIn]);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUserInfo(JSON.parse(savedUser));
      setIsLoggedIn(true);
    }
  }, []);


  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AppContainer>
          <Navigation
            isLoggedIn={isLoggedIn}
            onLogout={handleLogout}
            userInfo={userInfo}
          />
          <SubNavigation isLoggedIn={isLoggedIn} />
          <MainContent>
            <Routes>
              {/* 기본 경로로 접속하면 랜딩 페이지로 이동 */}
              <Route path="/" element={<LandingPage />} />
              <Route
              path="/login"
              element={<ApplicantLogin onLoginSuccess={handleLoginSuccess} />}
            />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute isLoggedIn={isLoggedIn}>
                  <MyPage userInfo={userInfo} />
                </PrivateRoute>
              }
            />
            <Route path="/terms" element={<TermsAgreement />} />
            <Route path="/signup" element={<ApplicantSignup />} />
            <Route path="/signup-complete" element={<ApplicantSignupComplete />} />
            <Route path="/admin" element={<ApplicantAdmin />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            {/* '/patent/:id' 경로가 PatentDetail 대신 DocumentEditor를 렌더링하도록 수정 */}
            <Route 
              path="/patent/:id" 
              element={<DocumentEditor />} 
            />

            {/* 보호 라우트 (로그인 해야만 접근 가능) */}
            <Route 
              path="/mypage" 
              element={<MyPage />} 
            />
        
            <Route 
              path="/search" 
              element={<SearchResult />} 
            />
            <Route 
              path="/submit/:id" 
              element={<FinalSubmitPage />} 
            />
            </Routes>
          </MainContent>
          <Footer />
        </AppContainer>
      </Router>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;