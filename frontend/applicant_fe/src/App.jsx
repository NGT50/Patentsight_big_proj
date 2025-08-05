import React from 'react';
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
  return (
    <Router>
      <AppContainer>
        <Navigation />
        <MainContent>
          <Routes>
            <Route path="/" element={<ApplicantDashboard />} />
            <Route path="/login" element={<ApplicantLogin />} />
            <Route path="/terms" element={<TermsAgreement />} />
            <Route path="/signup" element={<ApplicantSignup />} />
            <Route path="/signup-complete" element={<ApplicantSignupComplete />} />
            <Route path="/admin" element={<ApplicantAdmin />} />
          </Routes>
        </MainContent>
        <Footer />
      </AppContainer>
    </Router>
  );
}

export default App;