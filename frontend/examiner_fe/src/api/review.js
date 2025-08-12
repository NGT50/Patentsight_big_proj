// src/api/review.js
import axiosInstance from './axiosInstance';

// Review 도메인 API 함수들

/**
 * 1. 심사관 수동 배정
 */
export const assignReviewer = async (requestData) => {
  // POST /api/reviews/assign
  const response = await axiosInstance.post('/api/reviews/assign', requestData);
  return response.data;
};

/**
 * 2. 심사관 자동 배정
 */
export const autoAssign = async (type) => {
  // POST /api/reviews/assign/auto?type=...
  const response = await axiosInstance.post(`/api/reviews/assign/auto?type=${type}`);
  return response.data;
};

/**
 * 3. 심사 목록 조회
 */
export const getReviewList = async (userId, status) => {
  // GET /api/reviews/list/{userId}?status=...
  const response = await axiosInstance.get(`/api/reviews/list/${userId}`, {
    params: { status },
  });
  return response.data;
};

/**
 * 4. 심사 상세 조회
 */
export const getReviewDetail = async (reviewId) => {
  // GET /api/reviews/{reviewId}
  const response = await axiosInstance.get(`/api/reviews/${reviewId}`);
  return response.data;
};

/**
 * 5. 심사 결과 제출
 */
export const submitReview = async (requestData) => {
  // POST /api/reviews/submit
  const response = await axiosInstance.post('/api/reviews/submit', requestData);
  return response.data;
};

/**
 * 6. 의견서 작성
 */
export const createOpinionNotice = async (reviewId, requestData) => {
  // POST /api/reviews/{reviewId}/opinion-notices
  const response = await axiosInstance.post(`/api/reviews/${reviewId}/opinion-notices`, requestData);
  return response.data;
};

/**
 * 7. 의견서 목록 조회
 */
export const getOpinionNotices = async (reviewId) => {
  // GET /api/reviews/{reviewId}/opinion-notices
  const response = await axiosInstance.get(`/api/reviews/${reviewId}/opinion-notices`);
  return response.data;
};

/**
 * 8. 심사 대시보드 요약
 */
export const getDashboard = async (userId) => {
  // GET /api/reviews/dashboard/{userId}
  const response = await axiosInstance.get(`/api/reviews/dashboard/${userId}`);
  return response.data;
};

/**
 * 9. 심사관 최근 활동
 */
export const getRecentActivities = async () => {
  // GET /api/reviews/recent-activities
  const response = await axiosInstance.get('/api/reviews/recent-activities');
  return response.data;
};

/**
 * 10. 심사 목록 검색
 */
export const searchReviews = async (examinerId, params) => {
  // GET /api/reviews/search/{examinerId}?status=...&title=...&applicantId=...
  const response = await axiosInstance.get(`/api/reviews/search/${examinerId}`, { params });
  return response.data;
};