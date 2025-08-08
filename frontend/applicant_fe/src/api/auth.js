import axios from './axiosInstance';

// 로그인 API 호출 함수 (경로 및 필드명 수정)
export const loginUser = async ({ username, password }) => {
  try {
    // API 명세서 경로: POST /api/users/login
    const response = await axios.post('/api/users/login', { username, password });
    return response.data; // { token, user_id, ... }
  } catch (error) {
    console.error("로그인 실패:", error);
    throw new Error(error.response?.data?.message || '로그인에 실패했습니다.');
  }
};

// 출원인 회원가입 API 호출 함수 (경로 및 필드명 수정)
export const signupApplicant = async ({ username, password, name, birthDate, email }) => {
  try {
    // API 명세서 경로: POST /api/users/applicant
    const response = await axios.post('/api/users/applicant', {
      username,
      password,
      name,
      birthDate,
      email,
    });
    return response.data;
  } catch (error) {
    console.error("회원가입 실패:", error);
    throw new Error(error.response?.data?.message || '회원가입에 실패했습니다.');
  }
};