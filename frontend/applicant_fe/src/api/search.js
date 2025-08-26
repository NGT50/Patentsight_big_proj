import axios from './axiosInstance';

// 유사 특허 검색 API (GET 요청 및 query 파라미터 사용)
// src/api/patent.js

// Mock: 유사 특허 검색 (실제 서버 호출 대신 더미 데이터 반환)
export const searchSimilarPatents = async ({ searchQuery, top_n = 5 }) => {
  console.log("검색어:", searchQuery, " top_n:", top_n);

  // 실제 API 호출 대신, 하드코딩된 데이터 리턴
  return {
    answer: `"${searchQuery}" 관련 주요 특허 ${top_n}건을 찾았습니다.`,
    patents: [
      {
        id: 1,
        title: "AI 기반 자동차 제어 시스템",
        applicant: "현대자동차",
        year: 2024,
        summary: "차량의 주행 데이터를 활용하여 AI가 자동 제어하는 시스템",
      },
      {
        id: 2,
        title: "클라우드 네이티브 특허 검색 플랫폼",
        applicant: "삼성전자",
        year: 2023,
        summary: "클라우드 환경에서 대규모 특허 데이터를 효율적으로 검색하는 기술",
      },
      {
        id: 3,
        title: "딥러닝 기반 영상 분석 방법",
        applicant: "LG전자",
        year: 2022,
        summary: "딥러닝을 활용하여 영상 데이터에서 객체를 탐지하고 분류하는 방법",
      },
    ],
  };
};
