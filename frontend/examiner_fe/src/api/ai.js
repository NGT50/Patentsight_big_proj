// src/api/ai.js
import axiosInstance from './axiosInstance';
// 백엔드(8080) 절대 오리진 강제 — 유사 이미지 전용 fetch에서 사용
const API_ORIGIN =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_ORIGIN) ||
  'http://35.175.253.22:8080';

const toApiAbsolute = (p) => (p.startsWith('http') ? p : `${API_ORIGIN}${p}`);

/** 공통 404-더미 헬퍼 */
const swallow404 = async (fn, fallback) => {
  try {
    return await fn();
  } catch (e) {
    if (e?.response?.status === 404) return fallback;
    throw e;
  }
};

/** URL → File 변환 유틸 (이미지 URL도 form-data로 업로드 가능하게) */
async function toFileFromUrl(url, filename = 'image.png') {
  const token = localStorage.getItem('token');
  const isApi = url.startsWith('/api/') || url.startsWith(`${window.location.origin}/api/`);
  const res = await fetch(url, {
    headers: isApi && token ? { Authorization: `Bearer ${token}` } : {},
     credentials: 'include',
   });

  const blob = await res.blob();
  const name = filename || (url.split('/').pop() || 'image.png');
  const type = blob.type || 'image/png';
  return new File([blob], name, { type });
}

/* ----------------------------- 챗봇 ----------------------------- */

/** [챗봇] 세션 시작 (스펙: /api/ai/chat/sessions?patentId=&userId=) */
export const startChatSession = async (patentId, userId) => {
  return swallow404(
    async () => {
      const query = new URLSearchParams({ patentId: String(patentId) });
      if (userId != null) query.set('userId', String(userId));
      const res = await axiosInstance.post(`/api/ai/chat/sessions?${query.toString()}`);
      return res.data;
    },
    { id: crypto.randomUUID(), startedAt: new Date().toISOString(), status: 'ACTIVE', mock: true }
  );
};

/** [챗봇] 메시지 전송 (스펙: body { content }) */
export const sendChatMessageToServer = async (sessionId, payload) => {
  const body = {
    content: payload?.content ?? payload?.message ?? '',
    requested_features: payload?.requested_features,
    context: payload?.context,
  };
  return swallow404(
    async () => {
      const res = await axiosInstance.post(`/api/ai/chat/sessions/${sessionId}/messages`, body);
      return res.data;
    },
    {
      message_id: crypto.randomUUID(),
      sender: 'ASSISTANT',
      content: '⚠️ (모의 응답) 백엔드 AI 엔드포인트가 없어 기본 답변을 반환합니다.',
      created_at: new Date().toISOString(),
      executed_features: body.requested_features || [],
      features_result: (body.requested_features || []).map(f => `${f}: 준비중`),
      mock: true,
    }
  );
};

/* --------------------------- 문서 점검 --------------------------- */

/** [문서 점검] 스펙: POST /api/ai/patents/{patent_id}/validate */
export const validatePatentDocument = async (patentId) => {
  return swallow404(
    async () => {
      const res = await axiosInstance.post(`/api/ai/patents/${encodeURIComponent(patentId)}/validate`);
      return res.data;
    },
    [] // 더미: 문제 없음
  );
};

/* ------------------------ 유사 이미지 검색 ------------------------ */

/** [디자인 이미지 검색] 파일 업로드 (스펙: POST /api/ai/search/design/image form-data[file]) */
export const searchDesignImageByFile = async (file) => {
  return swallow404(
    async () => {
      const form = new FormData();
      form.append('file', file);
      const { data } = await axiosInstance.post(
      '/api/ai/search/design/image',
       form,
       { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      return data;
    },
    { results: [], input_image: null, mock: true }
  );
};

/** [디자인 이미지 검색] URL로 업로드 (내부에서 File로 변환) */
export const searchDesignImageByUrl = async (imageUrl) => {
  const file = await toFileFromUrl(imageUrl, 'design-image.png');
  return searchDesignImageByFile(file);
};

/** 파일 또는 URL 모두 허용하는 통합 함수 */
export const searchDesignImage = async (input) => {
  if (input instanceof File) return searchDesignImageByFile(input);
  if (typeof input === 'string') return searchDesignImageByUrl(input);
  throw new Error('searchDesignImage: File 또는 URL 문자열을 전달하세요.');
};

// 이미지 파일(blob)로 직접 유사 디자인 검색
// 이미지 파일(blob)로 직접 유사 디자인 검색
export async function searchDesignImageByBlob(imgUrl) {
  const token =
    localStorage.getItem('token') ||
    localStorage.getItem('accessToken') ||
    sessionStorage.getItem('token') ||
    sessionStorage.getItem('accessToken') || '';

  // 서버가 이해하는 스트림 경로로 강제 정규화
  // 목표: /api/files/content/{id}/stream  (이 포맷으로 맞춰 보냄)
  const toStreamUrl = (u) => {
    try {
      const url = new URL(u, window.location.origin);
      const p = url.pathname;

      // 1) 레거시: /files/{id}/content  →  /api/files/{id}/content  (존재하는 엔드포인트)
      let m = p.match(/^\/files\/(\d )\/content$/);
      if (m) return `/api/files/${m[1]}/content`;

      // 2) 이미 정답 경로면 그대로
      m = p.match(/^\/api\/files\/(\d )\/content$/);
      if (m) return p;


      

      // 4) 기타는 그대로
      return u;
    } catch {
      return u;
    }
  };

  // 상대 경로면 반드시 8080 절대 오리진으로 바꿔서 호출
  const normalized = toStreamUrl(imgUrl);
  const fetchUrl = normalized.startsWith('http') ? normalized : toApiAbsolute(normalized);

  const res = await fetch(fetchUrl, {
    headers: fetchUrl.includes('/api/') && token ? { Authorization: `Bearer ${token}` } : {},
    credentials: 'include',
  });

  if (!res.ok) {
    // 디버깅에 도움: 서버가 HTML을 돌려주면 JSON 파싱 에러가 나니, 여기서 막아줌
    const t = await res.text().catch(() => '');
    console.warn('image stream failed:', res.status, t.slice(0, 200));
    throw new Error(`image fetch failed: ${res.status}`);
  }

  const blob = await res.blob();
  const form = new FormData();
  form.append('file', blob, 'drawing.png');

  // 실제 유사 이미지 검색 호출 (백엔드 프록시)
  const r = await fetch(toApiAbsolute('/api/ai/search/design/image'), {
    method: 'POST',
    body: form,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    credentials: 'include',
  });

  if (!r.ok) {
    const t = await r.text().catch(() => '');
    console.warn('search api failed:', r.status, t.slice(0, 200));
    throw new Error(`search api failed: ${r.status}`);
  }
  return r.json();
}





/** [상표 이미지 검색] (스펙: POST /api/ai/search/trademark/image form-data[file]) */
export const searchTrademarkImage = async (input) => {
  const file = input instanceof File ? input : await toFileFromUrl(String(input), 'trademark-image.png');
  return swallow404(
    async () => {
      const form = new FormData();
      form.append('file', file);
      const { data } = await axiosInstance.post('/api/ai/search/trademark/image', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    },
    { results: [], input_image: null, mock: true }
  );
};

/** [이미지 URL 배열 분석] — 백엔드가 단일 업로드만 제공하면 프론트에서 순차 호출하여 합침 */
export const analyzeImageSimilarity = async (patentId, imageUrls = []) => {
  return swallow404(
    async () => {
      const batches = await Promise.all(
        imageUrls.map(async (u, idx) => {
          const rsp = await searchDesignImageByUrl(u);
          return {
            image_id: idx + 1,
            image_url: u,
            results: rsp?.results || [],
          };
        })
      );
      return { patent_id: patentId, batches };
    },
    // 더미
    {
      patent_id: patentId,
      batches: imageUrls.map((u, i) => ({
        image_id: i + 1,
        image_url: u,
        results: [
          {
            application_number: `MOCK-${i + 1}`,
            similarity: 0.52,
            title: `모의 유사 디자인 ${i + 1}`,
            applicant: 'Mock Inc.',
            image_url: u,
          },
        ],
      })),
      mock: true,
    }
  );
};

/* --------------------------- 3D 모델 생성 --------------------------- */

/** [3D 모델] 스펙: POST /api/ai/3d-models  (plural) */
export const generate3DModel = async (patentId, imageRef = {}) => {
  // imageRef: { image_id?: number, image_url?: string }
  return swallow404(
    async () => {
      const res = await axiosInstance.post('/api/ai/3d-models', {
        patent_id: patentId,
        ...imageRef,
      });
      return res.data; // { result_id, file_path }
    },
    { result_id: 'mock-3d', file_path: '/mock/ai-model.glb', mock: true }
  );
};

/* --------------------------- 거절 초안 생성 --------------------------- */

/** [거절 초안] 스펙: POST /api/ai/drafts/rejections  */
export const generateRejectionDraft = async (patentId, fileId) => {
  return swallow404(
    async () => {
      const res = await axiosInstance.post('/api/ai/drafts/rejections', {
        patentId, // 스펙 표기가 camelCase
        fileId,   // 선택값
      });
      return res.data;
    },
    {
      draftId: crypto.randomUUID(),
      type: 'REJECTION',
      content: `[거절사유서(모의)]\n출원번호: ${patentId}\n- 선행기술과의 차별성이 충분히 특정되지 않았습니다.\n- 효과에 대한 기재가 구체적이지 않습니다.\n보정 또는 의견서를 제출하시기 바랍니다.`,
      mock: true,
    }
  );
};
