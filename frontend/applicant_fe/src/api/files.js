import axios from './axiosInstance';

export const parsePatentPdf = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  try {
    const response = await axios.post('/api/patents/parse-pdf', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    console.error("PDF 파싱 실패:", error);
    throw new Error(error.response?.data?.message || 'PDF 분석에 실패했습니다.');
  }
};