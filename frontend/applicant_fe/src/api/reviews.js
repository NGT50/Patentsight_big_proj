import axios from './axiosInstance';

export const getReviewByPatentId = async (patentId) => {
  try {
    const res = await axios.get(`/api/reviews/patent/${patentId}`);
    return res.data;
  } catch (error) {
    console.error('특허 리뷰 조회 실패:', error);
    throw error;
  }
};

