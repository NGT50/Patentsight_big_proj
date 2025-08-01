import { useNavigate } from 'react-router-dom';

export default function Signup() {
  const navigate = useNavigate();

  const handleSignup = (e) => {
    e.preventDefault();
    // 나중에 가입 로직 넣을 자리
    navigate('/verify'); // 임시로 가입 후 인증 페이지로 이동
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleSignup} className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">📝 회원가입</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">이름</label>
          <input type="text" className="w-full px-4 py-2 border rounded" placeholder="홍길동" required />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">이메일</label>
          <input type="email" className="w-full px-4 py-2 border rounded" placeholder="your@email.com" required />
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">비밀번호</label>
          <input type="password" className="w-full px-4 py-2 border rounded" placeholder="••••••••" required />
        </div>
        <button type="submit" className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">
          회원가입
        </button>
        <p className="mt-4 text-sm text-center text-gray-600">
          이미 계정이 있으신가요?{' '}
          <button type="button" className="text-blue-600 underline" onClick={() => navigate('/')}>
            로그인
          </button>
        </p>
      </form>
    </div>
  );
}
