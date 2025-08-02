import axios from './axiosInstance';

export const createPatent = async ({ title, type, file_ids = [] }) => {
  const res = await axios.post('/api/patents', {
    title,
    type,
    file_ids,
  });
  return res.data;
};

// 이미 있는 createPatent 함수 아래에 추가
export async function getLatestFile(patentId) {
  const response = await axios.get(`/api/patents/${patentId}/file/latest`);
  return response.data; // { file_id, version_no, content }
}

// 문서 임시 저장 (PATCH)
export const updateFileContent = async (fileId, content) => {
  const res = await axios.patch(`/api/patents/file/${fileId}`, { content });
  return res.data; // { file_id, updated_at }
};

// 최종 제출 API
export const submitPatent = async (patentId) => {
  const res = await axios.post(`/api/patents/${patentId}/submit`);
  return res.data; // { patent_id, status, classification_codes: [...] }
};

// 내 출원 목록 조회
export const getMyPatents = async () => {
  const res = await axios.get('/api/patents/my');
  return res.data; // 배열 형태
};

// ✅ 이 부분을 꼭 추가하세요
export const getPatentDetail = async (patentId) => {
  const res = await axios.get(`/api/patents/${patentId}`);
  return res.data;
};
