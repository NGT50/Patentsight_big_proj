import axios from 'axios';

// 🚀 1. FastAPI에서 계속 사용할 엔드포인트 목록
const FAST_API_PREFIXES = [
  '/api/patents/parse-pdf',
  '/api/ai/validations',
  '/api/ai/draft/full-document'
];

// 🚀 2. Spring 백엔드가 담당할 엔드포인트 목록
const SPRING_API_PREFIXES = [
  '/api/patents',       // 특허 생성·수정·조회·제출
  '/api/reviews',       // 심사 관련
  '/api/files',         // 파일 업로드/다운로드
  '/api/notifications', // 알림 기능
  '/api/users',         // 회원가입, 로그인 등 사용자 기능
  '/api/ai'             // Spring이 담당하는 AI 기능 (초안 목록/수정 등)
];

const instance = axios.create({
  baseURL: '',  // baseURL은 요청 인터셉터에서 동적으로 설정
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✨ 3. 요청 인터셉터: URL에 따라 baseURL과 Authorization 헤더를 설정
instance.interceptors.request.use(
  (config) => {
    const isFastApi = FAST_API_PREFIXES.some(prefix => config.url.startsWith(prefix));
    const isSpringApi = SPRING_API_PREFIXES.some(prefix => config.url.startsWith(prefix));

    if (isFastApi) {
      // 🎯 FastAPI로 보내는 요청인 경우
      config.baseURL = 'http://3.26.101.212:8000';
      // [수정] FastAPI는 Spring JWT를 이해하지 못하므로 토큰을 제거
      delete config.headers.Authorization;
    } else if (isSpringApi) {
      // 🎯 Spring 백엔드로 보내는 요청인 경우
      config.baseURL = 'http://35.175.253.22:8080'; // 실제 Spring 서버 주소로 변경
      // [수정] JWT 토큰을 Authorization 헤더에 추가
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } else {
      // 그 외 요청(기본값 또는 다른 서비스)
      config.baseURL = 'http://35.175.253.22:8080';
      // 필요하다면 토큰을 붙이거나 제거할 수 있습니다.
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ✨ 4. 응답 인터셉터: 인증 오류 처리 등 기존 로직 유지
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    // 401 Unauthorized 응답이 오면 토큰을 삭제하고 로그인 페이지로 이동
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default instance;
