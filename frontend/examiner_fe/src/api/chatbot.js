import axios from 'axios';

const CHATBOT_API_URL = 'http://localhost:58080';

const chatbotApi = axios.create({
  baseURL: CHATBOT_API_URL,
  timeout: 300000, // 5 minutes timeout for AI model calls
  headers: {
    'Content-Type': 'application/json',
  },
});

export const sendChatMessage = async (sessionId, userMessage, applicationText = '', claimsText = '', forcedIntent = null) => {
  try {
    const response = await chatbotApi.post('/chat', {
      session_id: sessionId,
      user_msg: userMessage,
      application_text: applicationText,
      claims_text: claimsText,
      forced_intent: forcedIntent
    });
    
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Chatbot API Error:', error);
    return {
      success: false,
      error: error.response?.data || error.message || '챗봇 서버와 통신 중 오류가 발생했습니다.'
    };
  }
};

export const checkChatbotHealth = async () => {
  try {
    const response = await chatbotApi.get('/health');
    return response.data.ok === true;
  } catch (error) {
    console.error('Chatbot health check failed:', error);
    return false;
  }
};

export default chatbotApi;
