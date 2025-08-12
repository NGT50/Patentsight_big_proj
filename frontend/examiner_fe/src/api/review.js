// src/api/review.js
import { api } from './examiner';

// Review 도메인 API 함수들

/**
 * 1. 심사관 수동 배정
 * @param {object} requestData - { applicationNumber: number, examinerId: number }
 * @returns {Promise<object>} 생성된 리뷰 객체
 */
export const assignReviewer = async (requestData) => {
  // POST /api/reviews/assign
  const response = await api.post('/reviews/assign', requestData);
  return response.data;
};

/**
 * 2. 심사관 자동 배정
 * @param {string} type - 'PATENT' 등 특허 타입
 * @returns {Promise<object>} 자동 배정된 리뷰 객체
 */
export const autoAssign = async (type) => {
  // POST /api/reviews/assign/auto?type=...
  const response = await api.post(`/reviews/assign/auto?type=${type}`);
  return response.data;
};

/**
 * 3. 심사 목록 조회
 * @param {number} userId - 심사관 ID
 * @param {string} [status] - 'APPROVE', 'PENDING', 'REJECT' 등 심사 상태 (선택 사항)
 * @returns {Promise<Array<object>>} 리뷰 목록
 */
export const getReviewList = async (userId, status) => {
  // GET /api/reviews/list/{userId}?status=...
  const response = await api.get(`/reviews/list/${userId}`, {
    params: { status },
  });
  return response.data;
};

/**
 * 4. 심사 상세 조회
 * @param {number} reviewId - 리뷰 ID
 * @returns {Promise<object>} 리뷰 상세 정보
 */
export const getReviewDetail = async (reviewId) => {
  // GET /api/reviews/{reviewId}
  const response = await api.get(`/reviews/${reviewId}`);
  return response.data;
};

/**
 * 5. 심사 결과 제출
 * @param {object} requestData - { patentId: number, decision: string, comment: string }
 * @returns {Promise<object>} 업데이트된 리뷰 객체
 */
export const submitReview = async (requestData) => {
  // POST /api/reviews/submit
  const response = await api.post('/reviews/submit', requestData);
  return response.data;
};

/**
 * 6. 의견서 작성
 * @param {number} reviewId - 리뷰 ID
 * @param {object} requestData - 의견서 작성에 필요한 데이터
 * @returns {Promise<object>} 생성된 의견서 정보
 */
export const createOpinionNotice = async (reviewId, requestData) => {
  // POST /api/reviews/{reviewId}/opinion-notices
  const response = await api.post(`/reviews/${reviewId}/opinion-notices`, requestData);
  return response.data;
};

/**
 * 7. 의견서 목록 조회
 * @param {number} reviewId - 리뷰 ID
 * @returns {Promise<Array<object>>} 해당 리뷰의 의견서 목록
 */
export const getOpinionNotices = async (reviewId) => {
  // GET /api/reviews/{reviewId}/opinion-notices
  const response = await api.get(`/reviews/${reviewId}/opinion-notices`);
  return response.data;
};

/**
 * 8. 심사 대시보드 요약
 * @param {number} userId - 심사관 ID
 * @returns {Promise<object>} 대시보드 요약 정보
 */
export const getDashboard = async (userId) => {
  // GET /api/reviews/dashboard/{userId}
  const response = await api.get(`/reviews/dashboard/${userId}`);
  return response.data;
};

/**
 * 9. 심사관 최근 활동
 * @returns {Promise<Array<object>>} 최근 활동 목록
 */
export const getRecentActivities = async () => {
  // GET /api/reviews/recent-activities
  const response = await api.get('/reviews/recent-activities');
  return response.data;
};

/**
 * 10. 심사 목록 검색
 * @param {number} examinerId - 심사관 ID
 * @param {object} params - { status?: string, title?: string, applicantId?: number }
 * @returns {Promise<Array<object>>} 검색된 리뷰 목록
 */
export const searchReviews = async (examinerId, params) => {
  // GET /api/reviews/search/{examinerId}?status=...&title=...&applicantId=...
  const response = await api.get(`/reviews/search/${examinerId}`, { params });
  return response.data;
};