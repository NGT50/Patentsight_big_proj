// src/api/axiosInstance.js
import axios from 'axios';

// 필요하면 .env에서 덮어쓸 수 있게
// .env.development / .env.production 에서 VITE_API_BASE_URL=/api 로 두는 걸 권장
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  timeout: 15000,
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
