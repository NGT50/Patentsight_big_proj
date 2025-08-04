import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function Login() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('patent'); // ✅ 기본값: 특허

  const handleLogin = (e) => {
    e.preventDefault();

    if (userId === 'admin' && password === '1234') {
      // ✅ 사용자 정보 + 역할 저장
      localStorage.setItem(
        'user',
        JSON.stringify({
          id: userId,
          name: '홍길동',
          loginTime: Date.now(),
          role,
        })
      );

      // ✅ 역할에 따른 경로 이동
      if (role === 'patent') navigate('/patentdashboard');
      else if (role === 'design') navigate('/designdashboard');
    } else {
      alert('아이디 또는 비밀번호가 잘못되었습니다.');
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* 왼쪽 배너 */}
      <div className="w-1/3 bg-[#2b7dbc] flex flex-col justify-center items-center text-white">
        <img src="/patent_logo.png" alt="특허청 로고" className="w-28 mb-4" />
        <p className="text-sm text-center px-6 leading-relaxed">
          특허로 홈페이지를 방문해 주신 여러분을 환영합니다
        </p>
      </div>

      {/* 오른쪽 로그인 폼 */}
      <div className="w-2/3 flex items-center justify-center bg-gray-50 px-6">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-md bg-white p-8 rounded shadow-md border"
        >
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">👨‍💼 심사관 로그인</h2>

          {/* 아이디 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">아이디</label>
            <input
              type="text"
              required
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="아이디를 입력하세요"
              className="w-full border px-4 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 비밀번호 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">비밀번호</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요"
              className="w-full border px-4 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 담당 업무 선택 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">담당 업무</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="role"
                  value="patent"
                  checked={role === 'patent'}
                  onChange={() => setRole('patent')}
                />
                특허 심사
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="role"
                  value="design"
                  checked={role === 'design'}
                  onChange={() => setRole('design')}
                />
                디자인 심사
              </label>
            </div>
          </div>

          {/* 로그인 유지 체크 */}
          <div className="flex items-center mb-6">
            <input type="checkbox" id="remember" className="mr-2" />
            <label htmlFor="remember" className="text-sm text-gray-700">
              아이디 저장
            </label>
          </div>

          {/* 로그인 버튼 */}
          <button
            type="submit"
            className="w-full bg-[#2b7dbc] hover:bg-[#215f99] text-white py-2 rounded font-medium"
          >
            로그인
          </button>

          {/* 링크 */}
          <div className="flex justify-center gap-4 text-sm text-gray-600 mt-6">
            <button type="button" onClick={() => alert('아이디 찾기')} className="hover:underline">
              아이디 찾기
            </button>
            <span>|</span>
            <button type="button" onClick={() => alert('비밀번호 찾기')} className="hover:underline">
              비밀번호 찾기
            </button>
            <span>|</span>
            <button type="button" onClick={() => navigate('/signup')} className="hover:underline">
              회원가입
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
