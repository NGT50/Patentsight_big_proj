import axios from './axiosInstance';

// 유사 특허 검색 API (GET 요청 및 query 파라미터 사용)
export const searchSimilarPatents = async ({ searchQuery, top_n = 5 }) => {
  try {
    const response = await axios.get('/api/search/similar', {
      params: {
        query: searchQuery,
        top_n: top_n,
      }
    });
    // 백엔드가 answer와 patents 배열을 포함한 객체를 반환한다고 가정
    return response.data;
  } catch (error) {
    console.error("유사 특허 검색 실패:", error);
    throw new Error(error.response?.data?.message || '검색에 실패했습니다.');
  }
};