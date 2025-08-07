import axios from 'axios';
import { patentDetailMockData, recentActivitiesMock } from '../mocks/patentDetailMock';

// 환경 변수에서 API 기본 URL 가져오기
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    // 로그인 토큰은 추후 인증 기능 구현 시 여기에 추가
    // 'Authorization': `Bearer ${localStorage.getItem('token')}`
  },
});

/**
 * 심사관 전용 심사 목록 조회 API 연동
 * @param {string} userId - 로그인한 심사관의 ID
 * @returns {Promise<Array>} 심사 목록 배열
 */
export const getReviewList = async () => {
  return new Promise(resolve => {
    // 500ms 딜레이 후 목 데이터를 반환
    setTimeout(() => {
      resolve({ data: Object.values(patentDetailMockData) });
    }, );
  });
};

/**
 * 전체 심사 대시보드 요약 API 연동
 * @returns {Promise<Object>} 대시보드 통계 데이터
 */
export const getDashboardSummary = async () => {
  return new Promise(resolve => {
    setTimeout(() => {
      const patents = Object.values(patentDetailMockData);
      const today = new Date('2025-08-06'); // 테스트를 위해 현재 날짜를 고정
      const oneWeekAgo = new Date(today);
      oneWeekAgo.setDate(today.getDate() - 7);

      const total = patents.length;
      const reviewing = patents.filter(p => p.status === '심사중').length;
      const thisMonthReception = patents.filter(p => {
        const receptionDate = new Date(p.receptionDate);
        return receptionDate.getFullYear() === today.getFullYear() && receptionDate.getMonth() === today.getMonth();
      }).length;

      // 새로 추가된 지표: 출원서류 등록 7일 경과 건수
      const overdueForReview = patents.filter(p => {
        const receptionDate = new Date(p.receptionDate);
        // '심사대기' 상태이면서 등록일이 7일 이상 경과한 경우
        return p.status === '심사대기' && receptionDate < oneWeekAgo;
      }).length;

      resolve({
        data: {
          total: total,
          reviewing: reviewing,
          thisMonthReception: thisMonthReception,
          overdueForReview: overdueForReview, // 새로운 지표 추가
        }
      });
    }, );
  });
};


// 심사관의 최근 활동 로그 조회 API (목데이터 사용)
export const getRecentActivities = async () => {
    // API 호출 대신 Promise를 사용하여 목 데이터 반환
    return new Promise((resolve) => {
        setTimeout(() => {
            // ✅ activitiesResponse가 { data: ... } 형태로 반환되도록 수정
            resolve({ data: recentActivitiesMock });
        }, ); // 500ms 딜레이
    });
};
// ... 다른 API 함수들도 여기에 추가
// 예: getPatentDetail, searchReviewList 등