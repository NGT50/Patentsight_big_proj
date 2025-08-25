import { create } from 'zustand';

const authStore = create((set) => ({
  isLoggedIn: false,
  user: null,
  token: null,

  // 로그인 액션: 성공 시 상태 업데이트
  login: (userData) => {
    // 토큰과 사용자 정보를 localStorage에 저장
    localStorage.setItem('token', userData.token);
    localStorage.setItem('user', JSON.stringify(userData.user));
    localStorage.setItem('isLoggedIn', 'true');
    
    set({
      isLoggedIn: true,
      user: userData.user,
      token: userData.token,
    });
  },

  // 로그아웃 액션: 상태 초기화
  logout: () => {
    // localStorage에서 토큰과 사용자 정보 제거
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
    
    set({
      isLoggedIn: false,
      user: null,
      token: null,
    });
  },

  // 초기화: 페이지 새로고침 시 localStorage에서 상태 복원
  initialize: () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    const isLoggedIn = localStorage.getItem('isLoggedIn');

    if (token && user && isLoggedIn === 'true') {
      set({
        isLoggedIn: true,
        user: JSON.parse(user),
        token: token,
      });
    }
  },
}));

export default authStore;