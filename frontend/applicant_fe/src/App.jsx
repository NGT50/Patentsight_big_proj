import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import styled from 'styled-components';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// 팀의 공용 컴포넌트
import Navigation from './components/Navigation';
import Footer from './components/Footer';

// 우리가 만든 페이지 컴포넌트들
import MyPage from "./pages/MyPage";
import SearchResult from './pages/SearchResult';
import DocumentEditor from './pages/DocumentEditor';
import FinalSubmitPage from './pages/FinalSubmit';
import NewPatentChoicePage from './pages/NewPatentChoice';
import PatentCheckListPage from './pages/PatentCheckListPage';
import DesignCheckListPage from './pages/DesignCheckListPage';
import NotificationPanel from './components/NotificationPanel'; // 알림 패널 import

// 팀의 페이지 컴포넌트들 (우리가 병합할 대상)
import ApplicantSignup from './pages/ApplicantSignup';
import ApplicantSignupComplete from './pages/ApplicantSignupComplete';
import ApplicantLogin from './pages/ApplicantLogin';
import TermsAgreement from './pages/TermsAgreement';
import PrivacyPolicy from './pages/PrivacyPolicy';

// 우리가 만든 상태관리 및 라우팅 로직
import PrivateRoute from './components/PrivateRoute';
import useAuthStore from './stores/authStore';

const queryClient = new QueryClient();

// 팀의 레이아웃 스타일
const AppContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const MainContent = styled.main`
  flex: 1;
  background-color: #f5f5f5;
`;

function App() {
  // 상태 관리를 useState -> Zustand로 변경
  const { isLoggedIn, user, logout } = useAuthStore();
  // 알림 팝업 상태를 App.jsx에서 관리합니다.
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const toggleNotifications = () => setIsNotificationOpen(prev => !prev);
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AppContainer>
          <Navigation
            isLoggedIn={isLoggedIn}
            onLogout={logout}
            userInfo={user}
            onNotificationClick={toggleNotifications} // onNotificationClick 함수를 prop으로 전달
          />
          {isNotificationOpen && <NotificationPanel />}
          <MainContent>
            <Routes>
              {/* 공개 라우트 (팀 + 우리) */}
              <Route path="/" element={<Navigate to="/login" />} />
              <Route path="/login" element={<ApplicantLogin />} />
              <Route path="/signup" element={<ApplicantSignup />} />
              <Route path="/signup-complete" element={<ApplicantSignupComplete />} />
              <Route path="/terms" element={<TermsAgreement />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />

              {/* 보호 라우트 (우리) - 일단 끄고 진행 테스트 너무 불편*/}
              
              <Route path="/mypage" element={<MyPage />} />
              <Route path="/search" element={<SearchResult />} />
              <Route path="/patents/new" element={<NewPatentChoicePage />} />
              <Route path="/check/patents" element={<PatentCheckListPage />} />
              <Route path="/check/designs" element={<DesignCheckListPage />} />
              <Route path="/patent/:id" element={<DocumentEditor />} />
              <Route path="/submit/:id" element={<FinalSubmitPage />} />
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