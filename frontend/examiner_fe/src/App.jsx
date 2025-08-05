import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import styled from 'styled-components';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import ExaminerLogin from './pages/ExaminerLogin';
import ExaminerAuth from './pages/ExaminerAuth';
import ExaminerSignup from './pages/ExaminerSignup';
import ExaminerDashboard from './pages/ExaminerDashboard';
import ExaminerMyPage from './pages/ExaminerMyPage';

const AppContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  width: 100vw;
  overflow-x: hidden;
`;

const MainContent = styled.main`
  flex: 1;
  padding: 20px;
  background-color: #f5f5f5;
  width: 100%;
  
  @media (max-width: 768px) {
    padding: 15px;
  }
  
  @media (max-width: 480px) {
    padding: 10px;
  }
`;

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
  });

  // userInfo 상태 추가
  const [userInfo, setUserInfo] = useState(() => {
    const savedUserInfo = localStorage.getItem('userInfo');
    return savedUserInfo ? JSON.parse(savedUserInfo) : null;
  });

  const handleLoginSuccess = (userData) => {
    setIsLoggedIn(true);
    setUserInfo(userData);
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userInfo', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserInfo(null);
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userInfo');
  };

  return (
    <Router>
      <AppContainer>
        <Navigation 
          isLoggedIn={isLoggedIn} 
          userInfo={userInfo} // userInfo 전달
          onLoginSuccess={handleLoginSuccess}
          onLogout={handleLogout}
        />
        <MainContent>
          <Routes>
            
            {/* 첫 화면을 로그인 페이지로 변경 */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<ExaminerLogin onLoginSuccess={handleLoginSuccess} />} />
            <Route path="/auth" element={<ExaminerAuth />} />
            <Route path="/signup" element={<ExaminerSignup />} />
            <Route path="/mypage" element={<ExaminerMyPage userInfo={userInfo} onUpdateUserInfo={setUserInfo} />} />
          </Routes>
        </MainContent>
        <Footer />
      </AppContainer>
    </Router>
  );
}
export default App;