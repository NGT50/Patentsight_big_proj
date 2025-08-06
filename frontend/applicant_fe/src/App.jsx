import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import styled from 'styled-components';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import ApplicantSignup from './pages/ApplicantSignup';
import ApplicantSignupComplete from './pages/ApplicantSignupComplete';
import ApplicantLogin from './pages/ApplicantLogin';
import ApplicantDashboard from './pages/ApplicantDashboard';
import ApplicantAdmin from './pages/ApplicantAdmin';
import TermsAgreement from './pages/TermsAgreement';
import PrivacyPolicy from './pages/PrivacyPolicy';

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
  min-height: calc(100vh - 120px);
  
  @media (max-width: 768px) {
    padding: 15px;
    min-height: calc(100vh - 100px);
  }
  
  @media (max-width: 480px) {
    padding: 10px;
    min-height: calc(100vh - 90px);
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
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUserInfo(JSON.parse(savedUser));
      setIsLoggedIn(true);
    }
  }, []);


  return (
    <Router>
      <AppContainer>
        <Navigation
          isLoggedIn={isLoggedIn}
          onLogout={handleLogout}
          userInfo={userInfo}
        />
        <MainContent>
          <Routes>
            <Route
              path="/login"
              element={<ApplicantLogin onLoginSuccess={handleLoginSuccess} />}
            />
             {/* 기본 경로로 접속하면 로그인 페이지로 리디렉트 */}
            <Route path="/" element={<ApplicantLogin />} />
            <Route path="/dashboard" element={<ApplicantDashboard />} />
            <Route path="/terms" element={<TermsAgreement />} />
            <Route path="/signup" element={<ApplicantSignup />} />
            <Route path="/signup-complete" element={<ApplicantSignupComplete />} />
            <Route path="/admin" element={<ApplicantAdmin />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          </Routes>
        </MainContent>
        <Footer />
      </AppContainer>
    </Router>
  );
}

export default App;