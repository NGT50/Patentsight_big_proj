import { api } from './examiner';

/**
 * [챗봇] 새로운 챗봇 세션을 시작합니다.
 * @param {string | number} patentId - 관련 특허 ID
 * @returns {Promise<object>} 생성된 세션 정보 (e.g., { session_id, started_at })
 */
export const startChatSession = async (patentId) => {
  const response = await api.post('/ai/chat/sessions', { patent_id: patentId, session_type: 'DRAFT' });
  return response.data;
};

/**
 * [챗봇] AI 챗봇에게 메시지를 전송합니다.
 * @param {string} sessionId - 현재 챗봇 세션 ID
 * @param {string} message - 사용자가 입력한 메시지
 * @returns {Promise<object>} 챗봇의 응답 메시지 정보
 */
export const sendChatMessageToServer = async (sessionId, message) => {
  const response = await api.post(`/ai/chat/sessions/${sessionId}/messages`, { message });
  return response.data;
};

/**
 * [문서 점검] 출원 문서의 오류를 점검합니다.
 * @param {string | number} patentId - 점검할 특허 ID
 * @returns {Promise<Array<object>>} 오류 점검 결과 목록
 */
export const validatePatentDocument = async (patentId) => {
  const response = await api.post('/ai/validations', { patent_id: patentId });
  return response.data;
};

/**
 * [유사 디자인] 이미지 유사도를 분석합니다.
 * @param {string | number} patentId - 분석할 특허 ID
 * @param {Array<string | number>} imageIds - 분석할 이미지 ID 목록
 * @returns {Promise<Array<object>>} 이미지별 유사도 분석 결과
 */
export const analyzeImageSimilarity = async (patentId, imageIds = []) => {
  const response = await api.post('/ai/image-similarities', { patent_id: patentId, image_ids: imageIds });
  return response.data;
};

/**
 * [3D 모델] 2D 도면을 기반으로 3D 모델을 생성합니다.
 * @param {string | number} patentId - 관련 특허 ID
 * @param {string | number} imageId - 3D 모델 생성에 사용할 2D 이미지 ID
 * @returns {Promise<object>} 생성된 3D 모델 정보 (e.g., { result_id, file_path })
 */
export const generate3DModel = async (patentId, imageId) => {
  const response = await api.post('/ai/3d-models', { patent_id: patentId, image_id: imageId });
  return response.data;
};

/**
 * [초안 생성] AI를 사용하여 거절 사유 초안을 생성합니다.
 * @param {string | number} patentId - 관련 특허 ID
 * @returns {Promise<object>} 생성된 초안 정보 (e.g., { draftId, type, content })
 */
export const generateRejectionDraft = async (patentId) => {
  // API 명세에 fileId가 필요하다면 인자로 받아 함께 전송해야 합니다.
  const response = await api.post('/ai/draft/rejections', { patentId });
  return response.data;
};


// 디자인 유사도 이미지 검색 API
export const searchDesignImage = async (imageUrl) => {
  try {
    // 이미지 URL을 Blob으로 변환
    const response = await fetch(imageUrl);
    const blob = await response.blob();

    // Blob을 파일로 변환
    const imageFile = new File([blob], "design-image.png", { type: blob.type });

    const formData = new FormData();
    formData.append('file', imageFile);

    const apiResponse = await axiosInstance.post(
      '/api/ai/search/design/image',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return apiResponse.data;
  } catch (error) {
    console.error('디자인 유사 이미지 검색 실패:', error);
    throw error;
  }
};