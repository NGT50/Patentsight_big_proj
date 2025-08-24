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

// 상태코드 허용 범위
const okOrClientErr = (s) => s >= 200 && s < 300;
// ✅ submit 전용(동일해도 의미상 분리)
const okOnly = (s) => s >= 200 && s < 300;

// 서버에서 사용하는 상태/결정 문자열
const STATUS_SET = new Set([
  'DRAFT', 'SUBMITTED', 'REVIEWING', 'APPROVED', 'REJECTED', 'WAITING_ASSIGNMENT',
  'APPROVE', 'REJECT',
]);

const TYPE_SET = new Set(['PATENT', 'DESIGN']);

// 255자 안전 컷
const short255 = (s) => {
  const t = String(s ?? '');
  return t.length > 255 ? (t.slice(0, 252) + '…') : t;
};

/* -------------------- 결정 문자열 매핑 유틸 -------------------- */
// 👉 서버는 'APPROVE' / 'REJECT' 기대. 클라이언트가 'APPROVED'/'REJECTED'를 줘도 맞춰서 변환.
const mapDecisionForServer = (d) => {
  const v = String(d || '').toUpperCase();
  if (v === 'APPROVED') return 'APPROVE';
  if (v === 'REJECTED') return 'REJECT';
  return v; // SUBMITTED, REVIEWING, APPROVE, REJECT
};

/** 내부 유틸: 여러 파라미터 키 후보로 리스트 요청을 시도(항상 배열로 리턴) */
async function _listWithParams(userId, paramsCandidates) {
  let lastErr;
  for (const params of paramsCandidates) {
    try {
      const { data } = await axiosInstance.get(`/api/reviews/list/${userId}`, {
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
      const { data } = await axiosInstance.get(`/api/reviews/search/${examinerId}`, {
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
 * @param {{ applicationNumber:number, examinerId:number }} requestData
 */
export const assignReviewer = async (requestData) => {
  const { data } = await axiosInstance.post('/api/reviews/assign', requestData, {
    validateStatus: okOrClientErr,
  });
  return asObject(data);
};

/**
 * 2. 심사관 자동 배정
 * @param {'PATENT'|'DESIGN'} type
 */
export const autoAssign = async (type) => {
  const t = String(type || '').toUpperCase();
  const params = TYPE_SET.has(t) ? { type: t } : {};
  const { data } = await axiosInstance.post(`/api/reviews/assign/auto`, null, {
    params,
    validateStatus: okOrClientErr,
  });
  return asObject(data);
};

/**
 * 3. 심사 목록 조회 (강화판)
 * - 예전 호환: getReviewList(userId, 'SUBMITTED') → status 필터
 * - 새 용법  : getReviewList(userId, 'PATENT')   → type 필터
 * - 객체     : getReviewList(userId, { type: 'PATENT', status: 'REVIEWING' })
 * @returns {Array} 항상 배열
 */
export const getReviewList = async (userId, opts) => {
  if (!userId) throw new Error('userId is required');

  // 문자열로 온 경우(과거 호환)
  if (typeof opts === 'string') {
    const v = opts.toUpperCase();

    // "PATENT"/"DESIGN"이면 type 필터로 처리 (서버 키 다양성 대응)
    if (TYPE_SET.has(v)) {
      return _listWithParams(userId, [
        { type: v },
        { reviewType: v },
        { category: v },
        { targetType: v },
      ]);
    }

    // 상태로 취급
    if (STATUS_SET.has(v)) {
      const { data } = await axiosInstance.get(`/api/reviews/list/${userId}`, {
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
      const { data } = await axiosInstance.get(`/api/reviews/list/${userId}`, {
        params: { status },
        validateStatus: okOrClientErr,
      });
      return asArray(data);
    }

    // 필터 없음 → 전체
    const { data } = await axiosInstance.get(`/api/reviews/list/${userId}`, {
      validateStatus: okOrClientErr,
    });
    return asArray(data);
  }

  // 파라미터가 아예 없으면 전체
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
 * 5. 심사 결과 제출 (안전 버전)
 * - 'APPROVED' → 'APPROVE', 'REJECTED' → 'REJECT' 자동 매핑
 * - comment는 255자로 안전 컷
 * @param {{ patentId:number, decision:string, comment?:string }} requestData
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
// 교체: opinion-notice 생성 (plural/singular + JSON/FORM + camel/snake 모두 시도)
export const createOpinionNotice = async (reviewId, req = {}) => {
  if (!reviewId) throw new Error('reviewId is required');

  // 백엔드가 최소로 받을 가능성이 높은 조합들만 순차 시도
  const attempts = [
    // A) JSON (필수 최소형)
    {
      path: `/api/reviews/${reviewId}/opinion-notices`,
      headers: {}, // axios가 JSON 자동 설정
      body: { content: req.content ?? '' },
    },
    // B) JSON (camel)
    {
      path: `/api/reviews/${reviewId}/opinion-notices`,
      headers: {},
      body: {
        content: req.content ?? '',
        type: req.type,                 // 'APPROVAL' | 'EXAMINER_OPINION' | 'REJECTION'
        status: req.status ?? 'SUBMITTED',
        isAiDrafted: !!req.is_ai_drafted,
        structuredContent: req.structured_content ?? null,
        responseDueDate: req.response_due_date ?? null,
      },
    },
    // C) JSON (snake)
    {
      path: `/api/reviews/${reviewId}/opinion-notices`,
      headers: {},
      body: {
        content: req.content ?? '',
        type: req.type,
        status: req.status ?? 'SUBMITTED',
        is_ai_drafted: !!req.is_ai_drafted,
        structured_content: req.structured_content ?? null,
        response_due_date: req.response_due_date ?? null,
      },
    },
    // D) 같은 3세트를 단수 엔드포인트로 반복
    { path: `/api/reviews/${reviewId}/opinion-notice`, headers: {}, body: { content: req.content ?? '' } },
    {
      path: `/api/reviews/${reviewId}/opinion-notice`,
      headers: {}, body: {
        content: req.content ?? '', type: req.type, status: req.status ?? 'SUBMITTED',
        isAiDrafted: !!req.is_ai_drafted, structuredContent: req.structured_content ?? null,
        responseDueDate: req.response_due_date ?? null,
      }
    },
    {
      path: `/api/reviews/${reviewId}/opinion-notice`,
      headers: {}, body: {
        content: req.content ?? '', type: req.type, status: req.status ?? 'SUBMITTED',
        is_ai_drafted: !!req.is_ai_drafted, structured_content: req.structured_content ?? null,
        response_due_date: req.response_due_date ?? null,
      }
    },
    // E) x-www-form-urlencoded (snake, 최소형)
    {
      path: `/api/reviews/${reviewId}/opinion-notices`,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: (() => { const p = new URLSearchParams(); p.set('content', req.content ?? ''); return p; })(),
    },
    {
      path: `/api/reviews/${reviewId}/opinion-notice`,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: (() => { const p = new URLSearchParams(); p.set('content', req.content ?? ''); return p; })(),
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
      // 400인 경우 다음 포맷으로 즉시 폴백
      continue;
    }
  }
  // 디버깅에 도움되게 서버 응답 메시지 노출
  throw new Error(`createOpinionNotice failed: ${lastErr?.response?.status} ${JSON.stringify(lastErr?.response?.data)}`);
};


/**
 * 7. 의견서 목록 조회 (항상 배열)
 */
export const getOpinionNotices = async (reviewId) => {
  const { data } = await axiosInstance.get(`/api/reviews/${reviewId}/opinion-notices`, {
    validateStatus: okOrClientErr,
  });
  return asArray(data);
};

/**
 * 8. 심사 대시보드 요약 (항상 객체)
 */
export const getDashboard = async (userId) => {
  const { data } = await axiosInstance.get(`/api/reviews/dashboard/${userId}`, {
    validateStatus: okOrClientErr,
  });
  return asObject(data);
};

/**
 * 9. 심사관 최근 활동 (항상 배열)
 */
export const getRecentActivities = async () => {
  const { data } = await axiosInstance.get('/api/reviews/recent-activities', {
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
    const { data } = await axiosInstance.get(`/api/reviews/search/${examinerId}`, {
      params: rest,
      validateStatus: okOrClientErr,
    });
    return asArray(data);
  }
  const t = String(type).toUpperCase();
  if (!TYPE_SET.has(t)) {
    const { data } = await axiosInstance.get(`/api/reviews/search/${examinerId}`, {
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
