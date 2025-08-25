// src/api/files.js
import axiosInstance from './axiosInstance';

const API_ROOT = '/api/files';
const isHttpUrl = (u) => /^https?:\/\//i.test(u);
// 전역에서 주입되지 않으면 기본 퍼블릭 버킷 URL 사용
const S3_PUBLIC_BASE =
  (typeof globalThis !== 'undefined' && globalThis.S3_PUBLIC_BASE) ||
  'https://patentsight-artifacts-usea1.s3.us-east-1.amazonaws.com';

export function toAbsoluteFileUrl(u) {
  if (!u) return '';

  // 이미 S3 URL(프리사인 포함)이면 그대로 반환
  if (isHttpUrl(u) && u.includes('.s3.') && u.includes('amazonaws.com')) {
    return u;
  }

  const [key, query] = u.split('?');
  const name = key.substring(key.lastIndexOf('/') + 1);
  const encoded = encodeURIComponent(name);
  return `${S3_PUBLIC_BASE}/${encoded}${query ? `?${query}` : ''}`;
}

// 단건 메타 조회
export async function getFileDetail(fileId) {
  const { data } = await axiosInstance.get(`${API_ROOT}/${fileId}`);
  // 예상 응답: { fileId, patentId, fileName, fileUrl, uploaderId, updatedAt, ... }
  return { ...data, fileUrl: toAbsoluteFileUrl(data.fileUrl) };
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
    .map((m) => {
      const primary = m.fileUrl || m.url || '';
      if (primary) return toAbsoluteFileUrl(primary);
      if (m.patentId && m.fileName) {
        const enc = encodeURIComponent(m.fileName);
        return toAbsoluteFileUrl(`/api/files/${m.patentId}/${enc}`);
      }
      return '';
    })
    .filter(Boolean);
}

// 이미지가 아닌 첨부들 [{ id, name, url }]
export async function getNonImageFilesByIds(fileIds = []) {
  if (!Array.isArray(fileIds) || fileIds.length === 0) return [];
  const metas = await fetchMetas(fileIds);
  return metas
    .filter((m) => !isImageName(m.fileName || ''))
    .map((m) => {
      const fallback =
        m.patentId && m.fileName
          ? `/api/files/${m.patentId}/${encodeURIComponent(m.fileName)}`
          : '';
      const url = toAbsoluteFileUrl(m.fileUrl || m.url || fallback);
      return url
        ? { id: m.fileId || m.id, name: m.fileName || m.name || '', url }
        : null;
    })
    .filter(Boolean);
}

/* --------- 업로드/교체/삭제 (백엔드 스펙 그대로) --------- */
export async function uploadFile({ file, patentId }) {
  const form = new FormData();
  form.append('file', file);
  if (patentId != null) form.append('patentId', patentId);
  try {
    const { data } = await axiosInstance.post(API_ROOT, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return { ...data, fileUrl: toAbsoluteFileUrl(data.fileUrl) }; // { fileId, patentId, fileName, fileUrl, ... }
  } catch (error) {
    const msg = error.response?.data || error.message;
    console.error('S3 업로드 실패:', msg);
    throw new Error(msg);
  }
}

export async function updateFile(fileId, file) {
  const form = new FormData();
  form.append('file', file);
  try {
    const { data } = await axiosInstance.put(`${API_ROOT}/${fileId}`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return { ...data, fileUrl: toAbsoluteFileUrl(data.fileUrl) };
  } catch (error) {
    const msg = error.response?.data || error.message;
    console.error('S3 업로드 실패:', msg);
    throw new Error(msg);
  }
}

export async function deleteFile(fileId) {
  await axiosInstance.delete(`${API_ROOT}/${fileId}`);
}
