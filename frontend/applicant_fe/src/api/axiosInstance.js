import axios from 'axios';
 
// 🚀 1. FastAPI에서 계속 사용할 엔드포인트 목록
const FAST_API_PREFIXES = [
  '/api/patents/parse-pdf',
  '/api/ai/validations',
  '/api/ai/draft/full-document'
];

// 🚀 2. Spring 백엔드가 담당할 엔드포인트 목록
const SPRING_API_PREFIXES = [
  '/api/patents',      // 특허 CRUD
  '/api/reviews',      // 심사 관련
  '/api/files',        // 파일 업로드/다운로드
  '/api/notifications',// 알림 기능
  '/api/users',        // 회원가입, 로그인 등 사용자 기능
  '/api/ai'            // Spring이 담당하는 AI 기능 (초안 목록/수정 등)
];
const instance = axios.create({
  baseURL: '',
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✨ 3. 요청 인터셉터: URL에 따라 baseURL을 설정
instance.interceptors.request.use(
  (config) => {
    const isFastApi = FAST_API_PREFIXES.some(prefix => config.url.startsWith(prefix));
    const isSpringApi = SPRING_API_PREFIXES.some(prefix => config.url.startsWith(prefix));

    if (isFastApi) {
      // 🎯 FastAPI에서 제공하는 AI 기능을 호출
      config.baseURL = 'http://3.26.101.212:8000';
    } else if (isSpringApi) {
      // 🎯 여러분의 백엔드(Spring)를 호출
      config.baseURL = 'http://35.175.253.22:8080'; // 실제 서버 주소로 변경
    } else {
      // 기본값 또는 기타 마이크로서비스가 있다면 설정
      config.baseURL = 'http://35.175.253.22:8080';
    }

    // 토큰 추가 로직은 기존과 동일하게 유지
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default instance;

