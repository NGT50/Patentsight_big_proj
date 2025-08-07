import { create } from 'zustand';

const useAuthStore = create((set) => ({
  isLoggedIn: false,
  user: null,
  token: null,

  // 로그인 액션: 성공 시 상태 업데이트
  login: (userData) => {
    // 실제 앱에서는 토큰을 localStorage나 cookie에 저장하는 로직이 추가됩니다.
    set({
      isLoggedIn: true,
      user: userData.user,
      token: userData.accessToken,
    });
  },

  // 로그아웃 액션: 상태 초기화
  logout: () => {
    set({
      isLoggedIn: false,
      user: null,
      token: null,
    });
  },
}));

export default useAuthStore;