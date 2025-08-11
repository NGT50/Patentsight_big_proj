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
  return '';
};

const instance = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터: 토큰을 자동으로 헤더에 추가
instance.interceptors.request.use(
  (config) => {
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

// 응답 인터셉터: 401 에러 시 자동 로그아웃
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('isLoggedIn');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default instance; 