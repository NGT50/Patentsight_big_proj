// src/api/axiosInstance.js
import axios from 'axios';

const getBaseURL = () => {
  if (import.meta.env.DEV) return '';
  if (import.meta.env.PROD) return 'http://35.175.253.22:8080';
  return '';
};

const axiosInstance = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  timeout: 15000,
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
