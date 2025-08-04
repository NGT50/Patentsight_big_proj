import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MyPage from './pages/MyPage';
import PatentDetail from './pages/PatentDetail';
import SearchResult from './pages/SearchResult';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/patent/:id" element={<PatentDetail />} />
        <Route path="/search" element={<SearchResult />} />
      </Routes>
    </Router>
  );
}

export default App;
