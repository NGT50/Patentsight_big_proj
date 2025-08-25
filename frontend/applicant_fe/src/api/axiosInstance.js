import axios from 'axios';

// 🚀 1. FastAPI에서 계속 사용할 엔드포인트 목록
const FAST_API_PREFIXES = [
  '/api/patents/parse-pdf',
  '/api/ai/validations',
  '/api/ai/draft/full-document',
  '/api/ai/chat/sessions' // [수정] 챗봇 관련 API는 FastAPI가 담당하도록 여기에 위치해야 합니다.
];

// 🚀 2. Spring 백엔드가 담당할 엔드포인트 목록
const SPRING_API_PREFIXES = [
  '/api/patents',
  '/api/reviews',
  '/api/files',
  '/api/notifications',
  '/api/users',
  // [수정] '/api/ai'는 FastAPI의 AI 기능들과 충돌하므로, 더 구체적으로 명시합니다.
  // 만약 Spring에 '/api/ai/drafts' 같은 기능이 있다면 여기에 추가합니다.
  '/api/ai/drafts' 
];

const instance = axios.create({
  baseURL: '',  // baseURL은 요청 인터셉터에서 동적으로 설정
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✨ 3. 요청 인터셉터: (내부 로직은 변경 없음)
instance.interceptors.request.use(
  (config) => {
    const isFastApi = FAST_API_PREFIXES.some(prefix => config.url.startsWith(prefix));
    const isSpringApi = SPRING_API_PREFIXES.some(prefix => config.url.startsWith(prefix));

    if (isFastApi) {
      // 🎯 FastAPI로 보내는 요청인 경우
      config.baseURL = 'http://3.26.101.212:8000';
      delete config.headers.Authorization;
    } else if (isSpringApi) {
      // 🎯 Spring 백엔드로 보내는 요청인 경우
      config.baseURL = 'http://35.175.253.22:8080';
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } else {
      // 그 외 요청(기본값)은 Spring으로 보냅니다.
      config.baseURL = 'http://35.175.253.22:8080';
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    console.log(`Requesting to: ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ✨ 4. 응답 인터셉터: (변경 없음)
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