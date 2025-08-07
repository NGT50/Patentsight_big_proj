import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';

const PrivateRoute = ({ children }) => {
  // 1. 전역 스토어에서 로그인 상태를 가져옵니다.
  const { isLoggedIn } = useAuthStore();

  // 2. 로그인 상태에 따라 페이지를 보여주거나, 로그인 페이지로 리디렉션합니다.
  if (!isLoggedIn) {
    // 사용자가 원래 가려던 페이지 위치를 state에 저장해두면, 로그인 후 그 페이지로 보내주는 기능도 구현할 수 있습니다.
    return <Navigate to="/login" replace />;
  }

  // 3. 로그인 상태라면, 요청한 페이지(children)를 그대로 보여줍니다.
  return children;
};

export default PrivateRoute;