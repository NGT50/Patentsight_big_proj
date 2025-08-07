import React from 'react';
import { Link } from 'react-router-dom';

const SignupSuccessPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="p-10 text-center bg-white rounded-lg shadow-md">
        <svg className="w-16 h-16 mx-auto text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        <h2 className="mt-4 text-2xl font-bold text-gray-800">회원가입이 완료되었습니다.</h2>
        <p className="mt-2 text-gray-600">로그인 후 모든 서비스를 이용하실 수 있습니다.</p>
        <Link to="/login">
          <button className="w-full px-4 py-2 mt-6 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700">
            로그인하러 가기
          </button>
        </Link>
      </div>
    </div>
  );
};

export default SignupSuccessPage;