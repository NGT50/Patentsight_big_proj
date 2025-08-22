// src/api/patent.js
import axiosInstance from './axiosInstance';

/* =========================
   Patent 도메인 API 함수들
   ========================= */

// ---------- 공통 유틸 ----------
const okOrClientErr = (s) => s < 500;

// 배열로 쓰고 싶은 응답을 "무조건 배열"로 정규화
const asArray = (data) => {
  if (Array.isArray(data)) return data;

  // 흔한 래핑 케이스들
  if (data?.content && Array.isArray(data.content)) return data.content;
  if (data?.items && Array.isArray(data.items)) return data.items;
  if (data?.list && Array.isArray(data.list)) return data.list;
  if (data?.results && Array.isArray(data.results)) return data.results;

  // 비어있는 응답/문자열 응답 처리(204 등)
  if (data == null) return [];
  if (typeof data === 'string') {
    const t = data.trim();
    if (!t) return [];
    try {
      const parsed = JSON.parse(t);
      return asArray(parsed);
    } catch {
      return [];
    }
  }
  return [];
};

// 객체로 쓰고 싶은 응답을 "항상 객체"로 정규화
const asObject = (data) => {
  if (data && typeof data === 'object') return data;
  if (data == null) return {};
  if (typeof data === 'string') {
    const t = data.trim();
    if (!t) return {};
    try {
      const parsed = JSON.parse(t);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      return {};
    }
  }
  return {};
};

/* ---------- API 함수 ---------- */

// 출원 생성
export const createPatent = async (requestData) => {
  const { data } = await axiosInstance.post('/api/patents', requestData, {
    validateStatus: okOrClientErr,
  });
  return asObject(data);
};

// 출원 상세 정보 조회
export const getPatentDetail = async (patentId) => {
  const { data } = await axiosInstance.get(`/api/patents/${patentId}`, {
    validateStatus: okOrClientErr,
  });
  return asObject(data);
};

// 내 출원 목록 조회
export const getMyPatents = async () => {
  const { data } = await axiosInstance.get('/api/patents/my', {
    validateStatus: okOrClientErr,
  });
  return asArray(data);
};

// 출원 최종 제출
export const submitPatent = async (patentId) => {
  const { data } = await axiosInstance.post(`/api/patents/${patentId}/submit`, null, {
    validateStatus: okOrClientErr,
  });
  return asObject(data);
};

// 출원 상태 업데이트
// 서버 구현에 따라 { status: '...' } 또는 단순 문자열을 받을 수 있어 둘 다 대응
export const updatePatentStatus = async (patentId, status) => {
  const body = typeof status === 'string' ? { status } : status;
  const { data } = await axiosInstance.patch(`/api/patents/${patentId}/status`, body, {
    validateStatus: okOrClientErr,
  });
  return asObject(data);
};

// 출원 문서 버전 목록 조회
export const getDocumentVersions = async (patentId) => {
  const { data } = await axiosInstance.get(`/api/patents/${patentId}/document-versions`, {
    validateStatus: okOrClientErr,
  });
  return asArray(data);
};

// 최신 문서 내용 조회
export const getLatestDocument = async (patentId) => {
  const { data } = await axiosInstance.get(`/api/patents/${patentId}/document/latest`, {
    validateStatus: okOrClientErr,
  });
  return asObject(data);
};

// 문서 내용 단순 수정
export const updateDocumentContent = async (patentId, documentContent) => {
  // documentContent가 문자열/객체 모두 가능 → 객체 보장
  const body =
    typeof documentContent === 'string'
      ? { content: documentContent }
      : (documentContent || {});
  const { data } = await axiosInstance.patch(`/api/patents/${patentId}/document`, body, {
    validateStatus: okOrClientErr,
  });
  return asObject(data);
};

// 새 문서 버전 생성
export const createDocumentVersion = async (patentId, requestData) => {
  const { data } = await axiosInstance.post(
    `/api/patents/${patentId}/document-versions`,
    requestData,
    { validateStatus: okOrClientErr }
  );
  return asObject(data);
};

// 출원 삭제 (성공 시 바디 없음 가능)
export const deletePatent = async (patentId) => {
  await axiosInstance.delete(`/api/patents/${patentId}`, {
    validateStatus: okOrClientErr,
  });
  return true;
};
