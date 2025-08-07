import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signupApplicant } from '../api/auth'; // signupUser -> signupApplicant
import Button from '../components/Button';

const SignupPage = () => {
  const [formData, setFormData] = useState({
    username: '', // username 필드 추가
    name: '',
    email: '',
    password: '',
    passwordConfirm: '',
    birthDate: '', // dateOfBirth -> birthDate
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (formData.password !== formData.passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }
    try {
      // API 명세서에 맞는 필드명으로 데이터를 전달
      await signupApplicant({
        username: formData.username,
        password: formData.password,
        name: formData.name,
        birthDate: formData.birthDate,
        email: formData.email,
      });
      navigate('/signup-success');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-800">회원가입</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-sm font-medium text-gray-700">사용자 아이디</label>
            <input type="text" name="username" required onChange={handleChange} className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">이름</label>
            <input type="text" name="name" required onChange={handleChange} className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">이메일</label>
            <input type="email" name="email" required onChange={handleChange} className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" />
          </div>
           <div>
            <label className="text-sm font-medium text-gray-700">생년월일</label>
            <input type="date" name="birthDate" required onChange={handleChange} className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">비밀번호</label>
            <input type="password" name="password" required onChange={handleChange} className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">비밀번호 확인</label>
            <input type="password" name="passwordConfirm" required onChange={handleChange} className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="!pt-4">
            <Button type="submit" variant="primary" className="w-full">회원가입</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignupPage;