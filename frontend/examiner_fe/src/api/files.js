// src/api/files.js
import axiosInstance from './axiosInstance';

const API_ROOT = '/api/files';
const isHttpUrl = (u) => /^https?:\/\//i.test(u);

// 전역에서 주입되지 않으면 기본 퍼블릭 버킷 URL을 사용
const S3_PUBLIC_BASE =
  (typeof globalThis !== 'undefined' && globalThis.S3_PUBLIC_BASE) ||
  'https://patentsight-artifacts-usea1.s3.us-east-1.amazonaws.com';

// 백엔드가 '/uploads/...' 같은 경로 또는 S3 키를 줄 때 절대 URL로 보정
export function toAbsoluteFileUrl(u) {
  if (!u) return '';

  // 백엔드가 로컬 절대/상대 경로 혹은 http://.../uploads/... 형태를 줄 수 있다.
  // 이런 경우 마지막 파일명만 추출해 S3 퍼블릭 URL로 변환
  const toS3 = (p) => {
    const [key, query] = p.split('?');
    const name = key.substring(key.lastIndexOf('/') + 1);
    const encoded = encodeURIComponent(name);
    return `${S3_PUBLIC_BASE}/${encoded}${query ? `?${query}` : ''}`;
  };

  if (isHttpUrl(u)) {
    if (u.includes('/uploads/')) return toS3(u);
    return u;
  }

  if (u.includes('/uploads/')) return toS3(u);

  // S3 키(슬래시 없음)라면 퍼블릭 URL로 변환 + 인코딩
  if (!u.startsWith('/')) {
    return toS3(u);
  }

  const normalized = u.startsWith('/') ? u : `/${u.replace(/^\.?\//, '')}`;
  const encPath = encodeURI(normalized);
  const base = axiosInstance.defaults.baseURL; // ''(dev) 또는 'http://35.175.253.22:8080'(prod)

  // prod에선 절대 baseURL을 붙여주고, dev에선 프록시/동일오리진 가정
  if (base && isHttpUrl(base)) {
    return base.replace(/\/+$/, '') + encPath;
  }
  return encPath;
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
