import axios from './axiosInstance';

const API_ROOT = '/api/files';
const isHttpUrl = (u) => /^https?:\/\//i.test(u);

export function toAbsoluteFileUrl(u) {
  if (!u) return '';
  if (isHttpUrl(u)) return u;

  // S3 키(슬래시 없음)라면 퍼블릭 URL로 변환 + 인코딩
  if (!u.startsWith('/')) {
    const [key, query] = u.split('?');
    const encodedKey = encodeURIComponent(key);
    return `${S3_PUBLIC_BASE}/${encodedKey}${query ? `?${query}` : ''}`;
  }

  const normalized = u.startsWith('/') ? u : `/${u.replace(/^\.?\//, '')}`;
  const encPath = encodeURI(normalized);
  const base = axios.defaults.baseURL;

  if (base && isHttpUrl(base)) {
    return base.replace(/\/+$/, '') + encPath;
  }
  return encPath;
}

export const parsePatentPdf = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  try {
    const response = await axios.post('/api/patents/parse-pdf', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    console.error('PDF 파싱 실패:', error);
    throw new Error(error.response?.data?.message || 'PDF 분석에 실패했습니다.');
  }
};

export const getFileDetail = async (fileId) => {
  const { data } = await axios.get(`${API_ROOT}/${fileId}`);
  return { ...data, fileUrl: toAbsoluteFileUrl(data.fileUrl) };
};

const IMAGE_EXTS = new Set(['png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp', 'svg']);
const isImageName = (name = '') => IMAGE_EXTS.has(name.toLowerCase().split('.').pop() || '');

async function fetchMetas(ids = []) {
  return Promise.all(ids.map((id) => getFileDetail(id).catch(() => null))).then(
    (arr) => arr.filter(Boolean)
  );
}

export const getImageUrlsByIds = async (fileIds = []) => {
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
};

export const getNonImageFilesByIds = async (fileIds = []) => {
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
};

export const uploadFile = async ({ file, patentId }) => {
  const formData = new FormData();
  formData.append('file', file);
  if (patentId != null) formData.append('patentId', patentId);
  try {
    const res = await axios.post(API_ROOT, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    const data = res.data;
    return { ...data, fileUrl: toAbsoluteFileUrl(data.fileUrl) };
  } catch (error) {
    console.error('파일 업로드 실패:', error);
    throw error;
  }
};
