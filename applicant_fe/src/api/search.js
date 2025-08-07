import axios from './axiosInstance';

// 유사 특허 검색 API
export const searchSimilarPatents = async ({ searchQuery }) => {
  try {
    // API 명세에 따라 POST /api/search/similar 로 요청
    const response = await axios.post('/api/search/similar', { searchQuery });
    return response.data; // [{ patentId, title, ... }, ...] 형태의 배열을 기대
  } catch (error) {
    console.error("유사 특허 검색 실패:", error);
    throw new Error(error.response?.data?.message || '검색에 실패했습니다.');
  }
};