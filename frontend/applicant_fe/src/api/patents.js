// 'AxiosError'는 에러 타입 정의에 사용될 수 있으므로, 일단 그대로 둡니다.
import { AxiosError } from 'axios'; 
// 모든 요청은 우리가 만든 axios 인스턴스를 사용하도록 통일합니다.
import axios from './axiosInstance';

// 각 함수를 async/await와 try...catch로 감싸 에러 핸들링을 추가합니다.
export const createPatent = async (patentData) => {
  try {
    const res = await axios.post('/api/patents', patentData);
    return res.data; // { patentId, ... } 를 반환
  } catch (error) {
    console.error('출원 생성 실패:', error);
    throw error;
  }
};

export const getLatestFile = async (patentId) => {
  try {
    const response = await axios.get(`/api/patents/${patentId}/file/latest`);
    return response.data;
  } catch (error) {
    console.error('최신 파일 조회 실패:', error);
    throw error;
  }
};

export const updateFileContent = async (fileId, content) => {
  try {
    const res = await axios.patch(`/api/patents/file/${fileId}`, { content });
    return res.data;
  } catch (error) {
    console.error('문서 내용 수정 실패:', error);
    throw error;
  }
};

export const submitPatent = async (patentId, latestRequest) => {
  try {
    const res = await axios.post(`/api/patents/${patentId}/submit`, latestRequest);
    return res.data;
  } catch (error) {
    console.error('최종 제출 실패:', error);
    throw error;
  }
};

// getMyPatents 함수를 아래와 같이 수정합니다.
// 수정 후
export const getMyPatents = async ({ signal }) => {
  const res = await axios.get('/api/patents/my', {
    params: {},   // 필요한 경우 여기에 type 같은 필터 추가 가능
    signal,       // AbortSignal 은 axios 옵션으로 따로 전달
  });
  return res.data;
};


export const getPatentDetail = async (patentId) => {
  try {
    const res = await axios.get(`/api/patents/${patentId}`);
    return res.data;
  } catch (error) {
    console.error('출원 상세 정보 조회 실패:', error);
    throw error;
  }
};

export const getLatestDocument = async (patentId) => {
  try {
    const res = await axios.get(`/api/patents/${patentId}/document/latest`);
    return res.data;
  } catch (error) {
    console.error('최신 문서 조회 실패:', error);
    throw error;
  }
};

// 이하 모든 AI 관련 및 기타 함수들도 동일한 패턴으로 수정합니다.

export const generateClaimDraft = async ({ query, topK }) => {
  try {
    const res = await axios.post('/api/ai/drafts/claims', { query, topK });
    return res.data;
  } catch (error) {
    console.error('청구항 초안 생성 실패:', error);
    throw error;
  }
}

export const generateRejectionDraft = async (patentId) => {
  try {
    const res = await axios.post('/api/ai/draft/rejections', { patent_id: patentId });
    return res.data;
  } catch (error) {
    console.error('거절 사유 초안 생성 실패:', error);
    throw error;
  }
}

// 수정 후
export const validatePatentDocument = async (documentData) => {
  try {
    // documentData 객체 전체를 요청 body에 담아 보냅니다.
    const res = await axios.post('/api/ai/validations', documentData);
    return res.data;
  } catch (error) {
    console.error('문서 유효성 검증 실패:', error);
    throw error;
  }
};

export const startChatSession = async (patentId) => {
  try {
    const res = await axios.post('/api/ai/chat/sessions', {
      patent_id: patentId,
      session_type: 'DRAFT',
    });
    return res.data;
  } catch (error) {
    console.error('챗봇 세션 시작 실패:', error);
    throw error;
  }
}

// fetch를 사용하던 함수들을 axios로 통일합니다.
export const getDocumentVersions = async (patentId) => {
  try {
    const res = await axios.get(`/api/patents/${patentId}/document-versions`);
    return res.data;
  } catch (error) {
    console.error('문서 버전 목록 조회 실패:', error);
    throw error;
  }
};

export const restoreDocumentVersion = async (versionId) => {
  try {
    const res = await axios.post(`/api/document-versions/${versionId}/restore`);
    return res.data;
  } catch (error) {
    console.error('문서 버전 복원 실패:', error);
    throw error;
  }
};

export const sendMessageToChatSession = async (sessionId, message) => {
  try {
    const res = await axios.post(`/api/chat-sessions/${sessionId}/send-message`, { message });
    return res.data;
  } catch (error) {
    console.error('챗봇 메시지 전송 실패:', error);
    throw error;
  }
};

// 문서 내용 수정(임시저장) API
export const updateDocument = async ({ patentId, documentData }) => {
  try {
    const {
      title,
      type,
      cpc,
      inventor,
      technicalField,
      backgroundTechnology,
      inventionDetails,
      summary,
      drawingDescription,
      claims,
    } = documentData;

    const res = await axios.patch(`/api/patents/${patentId}/document`, {
      title,
      type,
      cpc,
      inventor,
      technicalField,
      backgroundTechnology,
      inventionDetails,
      summary,
      drawingDescription,
      claims,
    });
    return res.data;
  } catch (error) {
    console.error('문서 임시저장 실패:', error);
    throw error;
  }
};


// AI 기반 전체 문서 초안 생성 API (실제 API 호출로 변경)
export const generateFullDraft = async ({ title }) => {
  try {
    // 'query' 대신 'title'을 보내도록 수정합니다.
    const res = await axios.post('/api/ai/draft/full-document', { title });
    return res.data;
  } catch (error) {
    console.error('AI 초안 생성 실패:', error);
    throw new Error(error.response?.data?.detail || 'AI 초안 생성에 실패했습니다.');
  }
};
