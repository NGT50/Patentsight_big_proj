import axios from 'axios';

const instance = axios.create({
  baseURL: '', // 개발 중이면 프록시로 대체 가능 (ex: http://localhost:8080)
  headers: {
    'Content-Type': 'application/json',
  },
});

export default instance;
