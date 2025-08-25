// src/api/files.js
import axiosInstance from './axiosInstance';

const isHttpUrl = (u) => /^https?:\/\//i.test(u);

// 첨부 컨텐츠 스트리밍 API 경로
export const toApiContentUrl = (fileId) => `/api/files/${fileId}/content`;

// 단건 메타 조회
export async function getFileDetail(fileId) {
  const { data } = await axiosInstance.get(`${API_ROOT}/${fileId}`);
    // fileUrl은 DB 원본(S3 key) 그대로 둡니다. 표시에는 /content를 사용.
    return data;
}

const IMAGE_EXTS = new Set(['png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp', 'svg']);
const isImageName = (name = '') =>
  IMAGE_EXTS.has(name.toLowerCase().split('.').pop() || '');

// 첨부 ID 배열 → 메타 병렬 로딩
async function fetchMetas(ids = []) {
  return Promise.all(ids.map((id) => getFileDetail(id).catch(() => null))).then(
    (arr) => arr.filter(Boolean)
  );
}

// 이미지 URL만
export async function getImageUrlsByIds(fileIds = []) {
  if (!Array.isArray(fileIds) || fileIds.length === 0) return [];
  const metas = await fetchMetas(fileIds);
  return metas
    .filter((m) => isImageName(m.fileName || ''))
    .map((m) => toApiContentUrl(m.fileId))
    .filter(Boolean);
}

// 이미지가 아닌 첨부들 [{ id, name, url }]
export async function getNonImageFilesByIds(fileIds = []) {
  if (!Array.isArray(fileIds) || fileIds.length === 0) return [];
  const metas = await fetchMetas(fileIds);
  return metas
    .filter((m) => !isImageName(m.fileName || ''))
    .map((m) => ({
      id: m.fileId || m.id,
      name: m.fileName || m.name || '',
      url: toApiContentUrl(m.fileId),
    }))
    .filter(Boolean);
}

/* --------- 업로드/교체/삭제 (백엔드 스펙 그대로) --------- */
export async function uploadFile({ file, patentId }) {
  const form = new FormData();
  form.append('file', file);
  if (patentId != null) form.append('patentId', patentId);
  const { data } = await axiosInstance.post(API_ROOT, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return { ...data, fileUrl: toAbsoluteFileUrl(data.fileUrl) }; // { fileId, patentId, fileName, fileUrl, ... }
}

export async function updateFile(fileId, file) {
  const form = new FormData();
  form.append('file', file);
  const { data } = await axiosInstance.put(`${API_ROOT}/${fileId}`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return { ...data, fileUrl: toAbsoluteFileUrl(data.fileUrl) };
}

export async function deleteFile(fileId) {
  await axiosInstance.delete(`${API_ROOT}/${fileId}`);
}
