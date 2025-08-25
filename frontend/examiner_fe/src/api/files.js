// src/api/files.js
import axiosInstance from './axiosInstance';

const API_ROOT = '/api/files';
const S3_PUBLIC_BASE = 'https://patentsight-artifacts-usea1.s3.amazonaws.com';

const isHttpUrl = (u) => /^https?:\/\//i.test(u);

// 백엔드가 '/uploads/...' 같은 경로 또는 S3 키를 줄 때 절대 URL로 보정
export function toAbsoluteFileUrl(u) {
  if (!u) return '';
  if (isHttpUrl(u)) return u;

  // S3 키(슬래시 없음)라면 S3 퍼블릭 URL로 변환
  if (!u.startsWith('/')) {
    return `${S3_PUBLIC_BASE}/${u}`;
  }

  const normalized = u.startsWith('/') ? u : `/${u.replace(/^\.?\//, '')}`;
  const base = axiosInstance.defaults.baseURL; // ''(dev) 또는 'http://35.175.253.22:8080'(prod)

  // prod에선 절대 baseURL을 붙여주고, dev에선 프록시/동일오리진 가정
  if (base && isHttpUrl(base)) {
    return base.replace(/\/+$/, '') + normalized;
  }
  return normalized;
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
