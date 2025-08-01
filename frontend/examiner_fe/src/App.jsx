// App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Verify from './pages/Verify';
import PatentReview from './pages/PatentReview';
import DesignReview from './pages/DesignReview';
import PatentDashboard from './pages/PatentDashboard';
import DesignDashboard from './pages/DesignDashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/patentreview/:id" element={<PatentReview />} />
        <Route path="/designreview/:id" element={<DesignReview />} />
        <Route path="/patentdashboard" element={<PatentDashboard />} />
        <Route path="/designdashboard" element={<DesignDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
