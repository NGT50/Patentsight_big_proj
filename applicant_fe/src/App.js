import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// 컴포넌트 import
import MyPage from './pages/MyPage';
import PatentDetail from './pages/PatentDetail';
import SearchResult from './pages/SearchResult';
import LoginPage from './pages/Login';
import SignupPage from './pages/Signup';
import SignupSuccessPage from './pages/SignupSuccess';
import PrivateRoute from './components/PrivateRoute'; // PrivateRoute 컴포넌트 import
import DocumentEditor from './pages/DocumentEditor';
import FinalSubmitPage from './pages/FinalSubmit'; 
import NewPatentChoicePage from './pages/NewPatentChoice';

// (QueryClient import 등 나머지 코드는 동일)
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* 공개 라우트 (로그인 없이 접근 가능) */}
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/signup-success" element={<SignupSuccessPage />} />

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
            path="/patent/:id" 
            element={<PatentDetail />} 
          />
          <Route 
            path="/search" 
            element={<SearchResult />} 
          />
          <Route 
            path="/submit/:id" 
            element={<FinalSubmitPage />} 
          />
          <Route 
            path="/patents/new" 
            element={<NewPatentChoicePage />} 
          />
        </Routes>
      </Router>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;