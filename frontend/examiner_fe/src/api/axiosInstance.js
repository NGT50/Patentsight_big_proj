// src/api/axiosInstance.js
import axios from 'axios';

// 환경별 백엔드 서버 주소 설정
const getBaseURL = () => {
  // 개발 환경: 프록시 사용 (상대 경로)
  if (import.meta.env.DEV) {
    return ''; // 프록시를 통해 /api 요청이 백엔드로 전달됨
  }
  
  // 프로덕션 환경: 실제 배포된 서버 사용
  if (import.meta.env.PROD) {
    return 'http://35.175.253.22:8080';
  }
  
  // 기본값
  return '/api';
};

const axiosInstance = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  timeout: 150000,
  // 쿠키 세션 안 쓰면 false 유지
  withCredentials: false,
});

// JWT 자동 첨부
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 401 → 로그인으로
let _redirecting = false;
axiosInstance.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;

    // status가 없으면(프리플라이트/네트워크/CORS 실패) 콘솔에 힌트 남김
    if (!status) {
      console.error('Network/CORS error:', error?.message || error);
      return Promise.reject(error);
    }

    if (status === 401) {
      const path = window.location.pathname;
      const onAuthPage = path.startsWith('/login') || path.startsWith('/signup');

      // 세션 정리
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      localStorage.removeItem('username');
      localStorage.removeItem('isLoggedIn');

      if (!_redirecting && !onAuthPage) {
        _redirecting = true;
        const next = path + window.location.search;
        window.location.replace(`/login?next=${encodeURIComponent(next)}`);
      }
      return Promise.reject(error);
    }

    if (status === 403) {
      console.warn('Forbidden (403): 권한이 없습니다.');
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
