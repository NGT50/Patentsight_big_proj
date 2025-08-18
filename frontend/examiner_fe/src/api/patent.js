// src/api/patent.js
import axiosInstance from './axiosInstance';

// Patent 도메인 API 함수들

// 출원 생성
export const createPatent = async (requestData) => {
  // POST /patents
  const response = await axiosInstance.post('/api/patents', requestData);
  return response.data;
};

// 출원 상세 정보 조회
export const getPatentDetail = async (patentId) => {
  // GET /patents/{id}
  const response = await axiosInstance.get(`/api/patents/${patentId}`);
  return response.data;
};

// 내 출원 목록 조회
export const getMyPatents = async () => {
  // GET /patents/my
  const response = await axiosInstance.get('/api/patents/my');
  return response.data;
};

// 출원 최종 제출
export const submitPatent = async (patentId) => {
  // POST /patents/{id}/submit
  const response = await axiosInstance.post(`/api/patents/${patentId}/submit`);
  return response.data;
};

// 출원 상태 업데이트
export const updatePatentStatus = async (patentId, status) => {
  // PATCH /patents/{id}/status
  const response = await axiosInstance.patch(`/api/patents/${patentId}/status`, status);
  return response.data;
};

// 출원 문서 버전 목록 조회
export const getDocumentVersions = async (patentId) => {
  // GET /patents/{id}/document-versions
  const response = await axiosInstance.get(`/api/patents/${patentId}/document-versions`);
  return response.data;
};

// 최신 문서 내용 조회
export const getLatestDocument = async (patentId) => {
  // GET /patents/{id}/document/latest
  const response = await axiosInstance.get(`/api/patents/${patentId}/document/latest`);
  return response.data;
};

// 문서 내용 단순 수정
export const updateDocumentContent = async (patentId, documentContent) => {
  // PATCH /patents/{id}/document
  const response = await axiosInstance.patch(`/api/patents/${patentId}/document`, documentContent);
  return response.data;
};

// 새 문서 버전 생성
export const createDocumentVersion = async (patentId, requestData) => {
  // POST /patents/{id}/document-versions
  const response = await axiosInstance.post(`/api/patents/${patentId}/document-versions`, requestData);
  return response.data;
};

// 출원 삭제
export const deletePatent = async (patentId) => {
  // DELETE /patents/{id}
  await axiosInstance.delete(`/api/patents/${patentId}`);
};
