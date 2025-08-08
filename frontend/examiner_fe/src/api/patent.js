// src/api/patent.js
import { api } from './examiner';

// Patent 도메인 API 함수들

// 출원 생성
export const createPatent = async (requestData) => {
  // POST /api/patents
  const response = await api.post('/patents', requestData);
  return response.data;
};

// 출원 상세 정보 조회
export const getPatentDetail = async (patentId) => {
  // GET /api/patents/{id}
  const response = await api.get(`/patents/${patentId}`);
  return response.data;
};

// 내 출원 목록 조회
export const getMyPatents = async () => {
  // GET /api/patents/my
  const response = await api.get('/patents/my');
  return response.data;
};

// 출원 최종 제출
export const submitPatent = async (patentId) => {
  // POST /api/patents/{id}/submit
  const response = await api.post(`/patents/${patentId}/submit`);
  return response.data;
};

// 출원 상태 업데이트
export const updatePatentStatus = async (patentId, status) => {
  // PATCH /api/patents/{id}/status
  const response = await api.patch(`/patents/${patentId}/status`, status);
  return response.data;
};

// 출원 문서 버전 목록 조회
export const getDocumentVersions = async (patentId) => {
  // GET /api/patents/{id}/document-versions
  const response = await api.get(`/patents/${patentId}/document-versions`);
  return response.data;
};

// 최신 문서 내용 조회
export const getLatestDocument = async (patentId) => {
  // GET /api/patents/{id}/document/latest
  const response = await api.get(`/patents/${patentId}/document/latest`);
  return response.data;
};

// 문서 내용 단순 수정
export const updateDocumentContent = async (patentId, documentContent) => {
  // PATCH /api/patents/{id}/document
  const response = await api.patch(`/patents/${patentId}/document`, documentContent);
  return response.data;
};

// 새 문서 버전 생성
export const createDocumentVersion = async (patentId, requestData) => {
  // POST /api/patents/{id}/document-versions
  const response = await api.post(`/patents/${patentId}/document-versions`, requestData);
  return response.data;
};

// 출원 삭제
export const deletePatent = async (patentId) => {
  // DELETE /api/patents/{id}
  await api.delete(`/patents/${patentId}`);
};