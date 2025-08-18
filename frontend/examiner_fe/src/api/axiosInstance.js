// src/api/axiosInstance.js
import axios from 'axios';

// 필요하면 .env에서 덮어쓸 수 있게
// .env.development / .env.production 에서 VITE_API_BASE_URL=/api 로 두는 걸 권장
// 기본값을 ''으로 두고 각 API 함수에서 '/api/...'를 명시해 중복 방지
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

/**
 * 배포가 서브 경로(/applicant, /examiner)인 경우를 위해
 * 현재 URL에서 베이스 경로를 자동 감지한다.
 *  - /applicant/... → BASENAME = /applicant
 *  - /examiner/...  → BASENAME = /examiner
 *  - 그 외(루트 배포) → ''
 *
 * 이 값은 401 시 로그인 리다이렉트에 사용된다.
 */
const _path = typeof window !== 'undefined' ? window.location.pathname : '';
const BASENAME =
  _path.startsWith('/applicant') ? '/applicant'
  : _path.startsWith('/examiner') ? '/examiner'
  : '';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL, // 기본값 '' → API 함수에서 '/api/...' 전체 경로 작성
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
      // 현재 베이스 경로 기준으로 로그인/회원가입 페이지 인지 체크
      const onAuthPage =
        path === `${BASENAME}/login` ||
        path === `${BASENAME}/signup` ||
        path.startsWith(`${BASENAME}/login?`) ||
        path.startsWith(`${BASENAME}/signup?`);

      // 세션 정리
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      localStorage.removeItem('username');
      localStorage.removeItem('isLoggedIn');

      if (!_redirecting && !onAuthPage) {
        _redirecting = true;
        const next = path + window.location.search;
        // 서브 경로 배포 대응: 베이스 경로 + /login 로 보낸다
        window.location.replace(`${BASENAME}/login?next=${encodeURIComponent(next)}`);
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
