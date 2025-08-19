// src/api/review.js
import axiosInstance from './axiosInstance';

/* =========================
   Review 도메인 API 함수들
   ========================= */

/** ---------- 응답 정규화 유틸 ---------- */
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

// 4xx는 에러로, 204/빈 바디는 통과시키고 정규화할 수 있게
const okOrClientErr = (s) => s < 500;

const STATUS_SET = new Set([
  'DRAFT', 'SUBMITTED', 'REVIEWING', 'APPROVED', 'REJECTED',
  'APPROVE', 'REJECT', 'PENDING',
]);

const TYPE_SET = new Set(['PATENT', 'DESIGN']);

/** 내부 유틸: 여러 파라미터 키 후보로 리스트 요청을 시도(항상 배열로 리턴) */
async function _listWithParams(userId, paramsCandidates) {
  let lastErr;
  for (const params of paramsCandidates) {
    try {
      const { data } = await axiosInstance.get(`/reviews/list/${userId}`, {
        params,
        validateStatus: okOrClientErr,
      });
      return asArray(data);
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr;
}

/** 내부 유틸: 여러 파라미터 키 후보로 검색을 시도(항상 배열로 리턴) */
async function _searchWithParams(examinerId, paramsCandidates) {
  let lastErr;
  for (const params of paramsCandidates) {
    try {
      const { data } = await axiosInstance.get(`/reviews/search/${examinerId}`, {
        params,
        validateStatus: okOrClientErr,
      });
      return asArray(data);
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr;
}

/**
 * 1. 심사관 수동 배정
 * @param {object} requestData - { applicationNumber: number, examinerId: number }
 */
export const assignReviewer = async (requestData) => {
  const response = await axiosInstance.post('/reviews/assign', requestData);
  return response.data;
};

/**
 * 2. 심사관 자동 배정
 * @param {string} type - 'PATENT' | 'DESIGN'
 */
export const autoAssign = async (type) => {
  const response = await axiosInstance.post(`/reviews/assign/auto`, null, {
    params: { type },
  });
  return response.data;
};

/**
 * 3. 심사 목록 조회 (강화판)
 * - 예전 호환: getReviewList(userId, 'SUBMITTED') → status 필터
 * - 새 용법  : getReviewList(userId, 'PATENT') → type 필터
 * - 객체     : getReviewList(userId, { type: 'PATENT', status: 'REVIEWING' })
 * @returns {Array} 항상 배열
 */
export const getReviewList = async (userId, opts) => {
  if (!userId) throw new Error('userId is required');

  // 문자열로 온 경우(과거 호환)
  if (typeof opts === 'string') {
    const v = opts.toUpperCase();
    // ✅ "PATENT"/"DESIGN"이면 type 필터로 처리 (키 다양성 대응)
    if (TYPE_SET.has(v)) {
      return _listWithParams(userId, [
        { type: v },
        { reviewType: v },
        { category: v },
        { targetType: v },
      ]);
    }
    // ✅ 그 외는 status로 처리
    if (STATUS_SET.has(v)) {
      const { data } = await axiosInstance.get(`/reviews/list/${userId}`, {
        params: { status: v },
        validateStatus: okOrClientErr,
      });
      return asArray(data);
    }
  }

  // 객체로 온 경우
  if (opts && typeof opts === 'object') {
    const status = opts.status ? String(opts.status).toUpperCase() : undefined;
    const rawType = opts.type ?? opts.reviewType ?? opts.category ?? opts.targetType;
    const type = rawType ? String(rawType).toUpperCase() : undefined;

    // 타입이 있으면 여러 키로 시도
    if (type && TYPE_SET.has(type)) {
      const candidates = [
        { type, ...(status ? { status } : {}) },
        { reviewType: type, ...(status ? { status } : {}) },
        { category: type, ...(status ? { status } : {}) },
        { targetType: type, ...(status ? { status } : {}) },
      ];
      return _listWithParams(userId, candidates);
    }

    // 타입이 없고 상태만 있는 경우
    if (status && STATUS_SET.has(status)) {
      const { data } = await axiosInstance.get(`/reviews/list/${userId}`, {
        params: { status },
        validateStatus: okOrClientErr,
      });
      return asArray(data);
    }

    // 필터 없음
    const { data } = await axiosInstance.get(`/reviews/list/${userId}`, {
      validateStatus: okOrClientErr,
    });
    return asArray(data);
  }

  // 파라미터가 아예 없으면 전체
  const { data } = await axiosInstance.get(`/reviews/list/${userId}`, {
    validateStatus: okOrClientErr,
  });
  return asArray(data);
};

/**
 * 4. 심사 상세 조회
 */
export const getReviewDetail = async (reviewId) => {
  const response = await axiosInstance.get(`/reviews/${reviewId}`, {
    validateStatus: okOrClientErr,
  });
  return response.data; // 상세는 객체 그대로
};

/**
 * 5. 심사 결과 제출
 * @param {{ patentId:number, decision:string, comment:string }} requestData
 */
export const submitReview = async (requestData) => {
  const response = await axiosInstance.post('/reviews/submit', requestData);
  return response.data;
};

/**
 * 6. 의견서 작성
 */
export const createOpinionNotice = async (reviewId, requestData) => {
  const response = await axiosInstance.post(
    `/reviews/${reviewId}/opinion-notices`,
    requestData
  );
  return response.data;
};

/**
 * 7. 의견서 목록 조회 (항상 배열)
 */
export const getOpinionNotices = async (reviewId) => {
  const { data } = await axiosInstance.get(`/reviews/${reviewId}/opinion-notices`, {
    validateStatus: okOrClientErr,
  });
  return asArray(data);
};

/**
 * 8. 심사 대시보드 요약 (항상 객체)
 */
export const getDashboard = async (userId) => {
  const { data } = await axiosInstance.get(`/reviews/dashboard/${userId}`, {
    validateStatus: okOrClientErr,
  });
  return asObject(data);
};

/**
 * 9. 심사관 최근 활동 (항상 배열)
 */
export const getRecentActivities = async () => {
  const { data } = await axiosInstance.get('/reviews/recent-activities', {
    validateStatus: okOrClientErr,
  });
  return asArray(data);
};

/**
 * 10. 심사 목록 검색 (강화판, 항상 배열)
 * @param {number} examinerId
 * @param {object} params - { type?: 'PATENT'|'DESIGN', status?: string, title?: string, applicantId?: number, ... }
 */
export const searchReviews = async (examinerId, params = {}) => {
  const { type, ...rest } = params || {};
  if (!type) {
    const { data } = await axiosInstance.get(`/reviews/search/${examinerId}`, {
      params: rest,
      validateStatus: okOrClientErr,
    });
    return asArray(data);
  }
  const t = String(type).toUpperCase();
  if (!TYPE_SET.has(t)) {
    const { data } = await axiosInstance.get(`/reviews/search/${examinerId}`, {
      params,
      validateStatus: okOrClientErr,
    });
    return asArray(data);
  }
  // 서버별 키 호환: type / reviewType / category / targetType
  return _searchWithParams(examinerId, [
    { ...rest, type: t },
    { ...rest, reviewType: t },
    { ...rest, category: t },
    { ...rest, targetType: t },
  ]);
};
