import axios from './axiosInstance';

<<<<<<< HEAD
// 로그인 API 호출 함수 (경로 및 필드명 수정)
export const loginUser = async ({ username, password }) => {
  try {
    // API 명세서 경로: POST /api/users/login
    const response = await axios.post('/api/users/login', { username, password });
    return response.data; // { token, user_id, ... }
  } catch (error) {
    console.error("로그인 실패:", error);
    throw new Error(error.response?.data?.message || '로그인에 실패했습니다.');
=======
// 로그인 API 호출 함수 (백엔드 API 명세서에 맞게 수정)
export const loginUser = async ({ username, password }) => {
  try {
    console.log('로그인 요청 데이터:', { username, password });
    let requestData = { username, password }; // Reverted to username after DTO confirmation
    console.log('전송할 데이터:', requestData);
    const response = await axios.post('/api/users/login', requestData);
    console.log('로그인 성공 응답:', response.data);
    return response.data;
  } catch (error) {
    console.error("로그인 실패 상세:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
    
    // 더 자세한 에러 정보 출력
    console.error("전체 에러 객체:", error);
    console.error("에러 응답 데이터:", error.response?.data);
    console.error("에러 응답 헤더:", error.response?.headers);
    
    // 에러 메시지 추출 로직 개선
    let errorMessage = '로그인에 실패했습니다.';
    
    if (error.response?.data) {
      if (typeof error.response.data === 'string') {
        errorMessage = error.response.data;
      } else if (error.response.data.message) {
        errorMessage = error.response.data.message;
      } else if (error.response.data.error) {
        errorMessage = error.response.data.error;
      } else {
        errorMessage = JSON.stringify(error.response.data);
      }
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    if (error.response?.status === 400 && (!error.response?.data || Object.keys(error.response?.data).length === 0)) {
      errorMessage = '아이디 또는 비밀번호가 올바르지 않습니다. 또는 계정이 존재하지 않습니다.';
    }
    
    throw new Error(errorMessage);
>>>>>>> origin/woncicd
  }
};

// 출원인 회원가입 API 호출 함수 (경로 및 필드명 수정)
export const signupApplicant = async ({ username, password, name, birthDate, email }) => {
  try {
<<<<<<< HEAD
=======
    console.log('회원가입 요청 데이터:', { username, password, name, birthDate, email });
    
>>>>>>> origin/woncicd
    // API 명세서 경로: POST /api/users/applicant
    const response = await axios.post('/api/users/applicant', {
      username,
      password,
      name,
      birthDate,
      email,
    });
    console.log('회원가입 성공 응답:', response.data);
    return response.data;
  } catch (error) {
    console.error("회원가입 실패 상세:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
    throw new Error(error.response?.data?.message || error.response?.data || '회원가입에 실패했습니다.');
  }
};