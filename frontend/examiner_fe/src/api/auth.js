import axios from './axiosInstance';

// 심사관 로그인 API 호출 함수
export const loginUser = async ({ username, password }) => {
  try {
    console.log('심사관 로그인 요청 데이터:', { username, password });
    const response = await axios.post('/users/login', { username, password });
    console.log('심사관 로그인 성공 응답:', response.data);
    return response.data;
  } catch (error) {
    console.error("심사관 로그인 실패 상세:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
    
    console.error("전체 에러 객체:", error);
    console.error("에러 응답 데이터:", error.response?.data);
    console.error("에러 응답 헤더:", error.response?.headers);
    
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
  }
};

// 심사관 회원가입 API 호출 함수
export const signupExaminer = async ({ username, password, name, birthDate, department, employeeNumber, position }) => {
  try {
    console.log('심사관 회원가입 요청 데이터:', { username, password, name, birthDate, department, employeeNumber, position });
    
    const response = await axios.post('/users/examiner', {
      username,
      password,
      name,
      birthDate,
      department,
      employeeNumber,
      position,
    });
    console.log('심사관 회원가입 성공 응답:', response.data);
    return response.data;
  } catch (error) {
    console.error("심사관 회원가입 실패 상세:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
    
    // 에러 메시지 추출 로직
    let errorMessage = '회원가입에 실패했습니다.';
    
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
    
    throw new Error(errorMessage);
  }
};

// 심사관 인증 코드 검증 API 호출 함수
export const verifyExaminerCode = async ({ authCode }) => {
  try {
    console.log('심사관 인증 코드 검증 요청:', { authCode });
    
    const response = await axios.post('/users/verify-code', {
      authCode,
    });
    console.log('심사관 인증 코드 검증 성공 응답:', response.data);
    return response.data;
  } catch (error) {
    console.error("심사관 인증 코드 검증 실패 상세:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
    
    // 에러 메시지 추출 로직
    let errorMessage = '인증 코드 검증에 실패했습니다.';
    
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
    
    throw new Error(errorMessage);
  }
}; 