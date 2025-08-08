import axios from './axiosInstance';

// 로그인 API 호출 함수
export const loginUser = async ({ email, password }) => {
  try {
    // API 명세서에 따라 엔드포인트는 /api/auth/login 등으로 변경될 수 있습니다.
    const response = await axios.post('/api/auth/login', { email, password });
    return response.data; // { accessToken, user: { ... } } 형태를 기대
  } catch (error) {
    console.error("로그인 실패:", error);
    // 에러 응답이 있다면 그 메시지를, 없다면 일반 메시지를 throw
    throw new Error(error.response?.data?.message || '로그인에 실패했습니다.');
  }
};

// 회원가입 API 호출 함수 추가
export const signupUser = async ({ name, email, password, dateOfBirth }) => {
  try {
    const response = await axios.post('/api/auth/signup', {
      name,
      email,
      password,
      dateOfBirth, // API 명세에 따라 필드명은 변경될 수 있습니다.
    });
    return response.data;
  } catch (error) {
    console.error("회원가입 실패:", error);
    throw new Error(error.response?.data?.message || '회원가입에 실패했습니다.');
  }
};