import axiosInstance from './axiosInstance';

/* =========================
   Review 도메인 API 함수들
   ========================= */

// 배열로 쓰고 싶은 응답을 "무조건 배열"로 정규화
const asArray = (data) => {
  if (Array.isArray(data)) return data;
  if (data?.content && Array.isArray(data.content)) return data.content;
  if (data?.items && Array.isArray(data.items)) return data.items;
  if (data?.list && Array.isArray(data.list)) return data.list;
  if (data?.results && Array.isArray(data.results)) return data.results;
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

const okOrClientErr = (s) => s >= 200 && s < 300;
const okOnly = (s) => s >= 200 && s < 300;

const STATUS_SET = new Set([
  'DRAFT', 'SUBMITTED', 'REVIEWING', 'APPROVED', 'REJECTED', 'WAITING_ASSIGNMENT',
  'APPROVE', 'REJECT',
]);

// 255자 안전 컷
const short255 = (s) => {
  const t = String(s ?? '');
  return t.length > 255 ? (t.slice(0, 252) + '…') : t;
};

// 서버는 'APPROVE' / 'REJECT' 기대. 클라이언트에서 'APPROVED'/'REJECTED' 줘도 변환
const mapDecisionForServer = (d) => {
  const v = String(d || '').toUpperCase();
  if (v === 'APPROVED') return 'APPROVE';
  if (v === 'REJECTED') return 'REJECT';
  return v;
};

/**
 * 1. 심사관 수동 배정
 */
export const assignReviewer = async (requestData) => {
  const { data } = await axiosInstance.post('/api/reviews/assign', requestData, {
    validateStatus: okOrClientErr,
  });
  return asObject(data);
};

/**
 * 2. 심사관 자동 배정
 */
export const autoAssign = async (type) => {
  const { data } = await axiosInstance.post(`/api/reviews/assign/auto`, null, {
    params: { type },
    validateStatus: okOrClientErr,
  });
  return asObject(data);
};

/**
 * 3. 심사 목록 조회
 * - getReviewList(userId) → 전체
 * - getReviewList(userId, 'SUBMITTED') → status 필터
 */
export const getReviewList = async (userId, status) => {
  if (!userId) throw new Error('userId is required');

  if (status && STATUS_SET.has(status.toUpperCase())) {
    const { data } = await axiosInstance.get(`/api/reviews/list/${userId}`, {
      params: { status: status.toUpperCase() },
      validateStatus: okOrClientErr,
    });
    return asArray(data);
  }

  // status 없으면 전체
  const { data } = await axiosInstance.get(`/api/reviews/list/${userId}`, {
    validateStatus: okOrClientErr,
  });
  return asArray(data);
};

/**
 * 4. 심사 상세 조회
 */
export const getReviewDetail = async (reviewId) => {
  const { data } = await axiosInstance.get(`/api/reviews/${reviewId}`, {
    validateStatus: okOrClientErr,
  });
  return asObject(data);
};

/**
 * 5. 심사 결과 제출
 */
export const submitReview = async (requestData) => {
  const patentId = requestData?.patentId;
  const decision = mapDecisionForServer(requestData?.decision);
  const comment  = short255(requestData?.comment ?? '');

  if (!patentId) throw new Error('patentId is required');
  if (!decision) throw new Error('decision is required');

  const { data } = await axiosInstance.post(
    '/api/reviews/submit',
    { patentId, decision, comment },
    { validateStatus: okOnly }
  );
  return asObject(data);
};

/**
 * 6. 의견서 작성
 */
export const createOpinionNotice = async (reviewId, req = {}) => {
  if (!reviewId) throw new Error('reviewId is required');

  const attempts = [
    {
      path: `/api/reviews/${reviewId}/opinion-notices`,
      headers: {},
      body: { content: req.content ?? '' },
    },
    {
      path: `/api/reviews/${reviewId}/opinion-notices`,
      headers: {},
      body: {
        content: req.content ?? '',
        type: req.type,
        status: req.status ?? 'SUBMITTED',
        isAiDrafted: !!req.is_ai_drafted,
        structuredContent: req.structured_content ?? null,
        responseDueDate: req.response_due_date ?? null,
      },
    },
  ];

  let lastErr;
  for (const a of attempts) {
    try {
      const { data } = await axiosInstance.post(a.path, a.body, {
        headers: a.headers, validateStatus: s => s >= 200 && s < 300,
      });
      return data;
    } catch (e) {
      lastErr = e;
      continue;
    }
  }
  throw new Error(`createOpinionNotice failed: ${lastErr?.response?.status} ${JSON.stringify(lastErr?.response?.data)}`);
};

/**
 * 7. 의견서 목록 조회
 */
export const getOpinionNotices = async (reviewId) => {
  const { data } = await axiosInstance.get(`/api/reviews/${reviewId}/opinion-notices`, {
    validateStatus: okOrClientErr,
  });
  return asArray(data);
};

/**
 * 8. 심사 대시보드 요약
 */
export const getDashboard = async (userId) => {
  const { data } = await axiosInstance.get(`/api/reviews/dashboard/${userId}`, {
    validateStatus: okOrClientErr,
  });
  return asObject(data);
};

/**
 * 9. 심사관 최근 활동
 */
export const getRecentActivities = async () => {
  const { data } = await axiosInstance.get('/api/reviews/recent-activities', {
    validateStatus: okOrClientErr,
  });
  return asArray(data);
};

/**
 * 10. 심사 목록 검색
 */
export const searchReviews = async (examinerId, params = {}) => {
  if (!examinerId) throw new Error('examinerId is required');

  const { data } = await axiosInstance.get(`/api/reviews/search/${examinerId}`, {
    params,
    validateStatus: okOrClientErr,
  });
  return asArray(data);
};
