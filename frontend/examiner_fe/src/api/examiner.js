// src/api/examiner.js

import axios from 'axios';

// Axios 인스턴스 생성
const api = axios.create({
  baseURL: 'http://localhost:8080/api', // 백엔드 API 기본 주소
  headers: {
    'Content-Type': 'application/json',
    // 다른 필요한 헤더들을 여기에 추가
  },
  timeout: 5000, // 요청 타임아웃
});

// 생성한 인스턴스를 내보내기
export { api };