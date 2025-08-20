import axios from 'axios';

// 1. 우리가 만든 기능들이 사용하는 API 경로들을 정의합니다.
const MY_API_PREFIXES = ['/api/patents', '/api/ai', '/api/search','/api/search/similar'];

const instance = axios.create({
  // baseURL은 비워두어 요청별로 서버 주소를 결정하도록 합니다.
  baseURL: '', 
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. 요청 인터셉터를 사용하여, URL에 따라 서버 주소를 동적으로 바꿔줍니다.
instance.interceptors.request.use(
  (config) => {
    // 요청 URL이 우리가 만든 API 경로 중 하나로 시작하는지 확인합니다.
    const isMyApi = MY_API_PREFIXES.some(prefix => config.url.startsWith(prefix));

    if (isMyApi) {
      // 우리가 만든 기능이라면, 개발자님의 AWS 서버 주소를 사용합니다.
      config.baseURL = 'http://3.26.101.212:8000';
    } else {
      // 그 외 다른 기능이라면, 팀의 다른 서버 주소를 사용합니다.
      config.baseURL = 'http://35.175.253.22:8080';
    }

    // 토큰 추가 로직은 그대로 유지합니다.
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

// 응답 인터셉터는 그대로 유지합니다.
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default instance;