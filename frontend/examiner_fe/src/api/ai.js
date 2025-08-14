// src/api/ai.js
import axiosInstance from './axiosInstance';

/** 공통 404-더미 헬퍼 */
const swallow404 = async (fn, fallback) => {
  try {
    return await fn();
  } catch (e) {
    if (e?.response?.status === 404) return fallback;
    throw e;
  }
};

/** [챗봇] 세션 시작 */
export const startChatSession = async (patentId) => {
  return swallow404(
    async () => {
      const res = await axiosInstance.post('/api/ai/chat/sessions', { patent_id: patentId, session_type: 'DRAFT' });
      return res.data;
    },
    // 더미
    { session_id: crypto.randomUUID(), started_at: new Date().toISOString(), mock: true }
  );
};

/** [챗봇] 메시지 전송 */
export const sendChatMessageToServer = async (sessionId, payload) => {
  // payload는 { message: string, requested_features?: string[] } 형태를 기대
  return swallow404(
    async () => {
      const res = await axiosInstance.post(`/api/ai/chat/sessions/${sessionId}/messages`, payload);
      return res.data;
    },
    // 더미
    {
      message_id: crypto.randomUUID(),
      content: '⚠️ (모의 응답) 백엔드 AI 엔드포인트가 없어 기본 답변을 반환합니다.',
      created_at: new Date().toISOString(),
      executed_features: payload?.requested_features || [],
      features_result: (payload?.requested_features || []).map(f => `${f}: 지원 준비중`),
    }
  );
};

/** [문서 점검] */
export const validatePatentDocument = async (patentId) => {
  return swallow404(
    async () => {
      const res = await axiosInstance.post('/api/ai/validations', { patent_id: patentId });
      return res.data;
    },
    [] // 더미: 문제 없음
  );
};

/** [유사 이미지] 이미지 URL로 분석 */
export const analyzeImageSimilarity = async (patentId, imageUrls = []) => {
  return swallow404(
    async () => {
      const res = await axiosInstance.post('/api/ai/similarity', {
        patent_id: patentId,
        image_urls: imageUrls,
      });
      return res.data;
    },
    // 더미 결과
    imageUrls.map((u, i) => ({
      image_id: i + 1,
      image_url: u,
      similar_patent_code: `MOCK-${i + 1}`,
      similarity_score: 42 + i, // 대충 점수
    }))
  );
};

/** [3D 모델] */
export const generate3DModel = async (patentId, imageRef = {}) => {
  return swallow404(
    async () => {
      const res = await axiosInstance.post('/api/ai/3d-model', {
        patent_id: patentId,
        ...imageRef, // { image_id?, image_url? }
      });
      return res.data;
    },
    { file_path: '/mock/ai-model.glb' } // 더미
  );
};

/** [거절 초안] */
export const generateRejectionDraft = async (patentId) => {
  return swallow404(
    async () => {
      const res = await axiosInstance.post('/api/ai/draft/rejections', { patent_id: patentId });
      return res.data;
    },
    {
      draftId: crypto.randomUUID(),
      type: 'REJECTION',
      content:
`[거절사유서(모의)]
출원번호: ${patentId}
- 선행기술과의 차별성이 충분히 특정되지 않았습니다.
- 효과에 대한 기재가 구체적이지 않습니다.
보정 또는 의견서를 제출하시기 바랍니다.`,
    }
  );
};

/** [디자인 이미지 검색] (멀티파트 업로드는 유지) */
export const searchDesignImage = async (imageUrl) => {
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const imageFile = new File([blob], 'design-image.png', { type: blob.type || 'image/png' });

    const formData = new FormData();
    formData.append('file', imageFile);

    const apiResponse = await axiosInstance.post('/api/ai/search/design/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return apiResponse.data;
  } catch (error) {
    // 404면 더미
    if (error?.response?.status === 404) {
      return { results: [], mock: true };
    }
    console.error('디자인 유사 이미지 검색 실패:', error);
    throw error;
  }
};
