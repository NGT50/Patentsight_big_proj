import { useState } from 'react';
import { User, Lock, Shield, ChevronRight, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();

  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('patent');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault(); // 폼 기본 동작(새로고침) 방지

    if (userId === 'admin' && password === '1234') {
      localStorage.setItem(
        'user',
        JSON.stringify({
          id: userId,
          name: '홍길동',
          loginTime: Date.now(),
          role,
        })
      );

      if (role === 'patent') navigate('/patentdashboard');
      else if (role === 'design') navigate('/designdashboard');
    } else {
      alert('아이디 또는 비밀번호가 잘못되었습니다.');
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-blue-50">
      {/* 왼쪽 배너 - 브랜딩 섹션 */}
      <div className="hidden lg:flex lg:w-2/5 relative overflow-hidden">
        {/* 배경 그라디언트 - 더 밝고 부드럽게 */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-500"></div>

        {/* 장식적 요소들 - 더 부드럽게 */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-white/15 rounded-full blur-xl"></div>
        <div className="absolute bottom-40 right-32 w-24 h-24 bg-white/10 rounded-full blur-lg"></div>
        <div className="absolute top-1/2 left-10 w-16 h-16 bg-white/10 rounded-full blur-md"></div>

        {/* 메인 콘텐츠 */}
        <div className="relative z-10 flex flex-col justify-center items-center text-white px-12 w-full">
          {/* 특허청 로고 - 더 밝은 배경 */}
          <div className="mb-8 p-6 bg-white/15 backdrop-blur-sm rounded-2xl border border-white/25 shadow-xl">
            <div className="w-20 h-20 bg-white rounded-xl flex items-center justify-center mb-4 mx-auto shadow-lg">
              <div className="w-12 h-12 relative">
                {/* 태극 마크 스타일 아이콘 - 더 부드러운 색상 */}
                <div className="w-full h-full rounded-full border-4 border-blue-500 relative">
                  <div className="w-6 h-6 bg-blue-500 rounded-full absolute top-0 left-3"></div>
                  <div className="w-6 h-6 bg-rose-400 rounded-full absolute bottom-0 right-3"></div>
                </div>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-center tracking-wide">특허청</h1>
            <p className="text-blue-50 text-center text-sm mt-2">Korean Intellectual Property Office</p>
          </div>

          {/* 환영 메시지 */}
          <div className="text-center max-w-md">
            <h2 className="text-3xl font-bold mb-4 leading-tight">
              지식재산권 심사관
              <span className="block text-blue-100">업무 포털</span>
            </h2>
            <p className="text-blue-50 leading-relaxed text-lg">
              특허와 디자인 심사 업무를 위한<br />
              통합 관리 시스템에 오신 것을 환영합니다
            </p>
          </div>

          {/* 하단 정보 */}
          <div className="absolute bottom-8 left-8 right-8 text-center">
            <p className="text-blue-100 text-sm">
              © 2024 Korean Intellectual Property Office. All rights reserved.
            </p>
          </div>
        </div>
      </div>

      {/* 오른쪽 로그인 폼 */}
      <div className="flex-1 lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* 로그인 카드 */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            {/* 헤더 - 더 부드러운 색상 */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-8 py-8 text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Shield className="w-8 h-8 text-blue-500" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">심사관 로그인</h2>
              <p className="text-blue-50 text-sm">보안 인증을 통해 시스템에 접속하세요</p>
            </div>

            {/* 폼 내용 */}
            <form onSubmit={handleLogin} className="p-8 space-y-6"> {/* <form> 태그를 여기에 추가 */}
              {/* 담당 업무 선택 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">담당 업무</label>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setRole('patent')}
                    className={`flex items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      role === 'patent'
                        ? 'border-blue-400 bg-blue-50 text-blue-600'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                  >
                    <div className="text-center">
                      <div className={`w-8 h-8 mx-auto mb-2 rounded-full flex items-center justify-center ${
                        role === 'patent' ? 'bg-blue-400 text-white' : 'bg-gray-200 text-gray-500'
                      }`}>
                        <Shield className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-medium">특허 심사</span>
                    </div>
                  </div>

                  <div
                    onClick={() => setRole('design')}
                    className={`flex items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      role === 'design'
                        ? 'border-blue-400 bg-blue-50 text-blue-600'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                  >
                    <div className="text-center">
                      <div className={`w-8 h-8 mx-auto mb-2 rounded-full flex items-center justify-center ${
                        role === 'design' ? 'bg-blue-400 text-white' : 'bg-gray-200 text-gray-500'
                      }`}>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </div>
                      <span className="text-sm font-medium">디자인 심사</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 아이디 입력 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">아이디</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    placeholder="심사관 아이디를 입력하세요"
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all placeholder-gray-400 text-gray-900"
                  />
                </div>
              </div>

              {/* 비밀번호 입력 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">비밀번호</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="비밀번호를 입력하세요"
                    className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all placeholder-gray-400 text-gray-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              {/* 아이디 저장 (로그인 유지에서 아이디 저장으로 텍스트 변경) */}
              <div className="flex items-center">
                <div
                  onClick={() => setRememberMe(!rememberMe)}
                  className="flex items-center cursor-pointer"
                >
                  <div className={`w-4 h-4 border-2 rounded ${
                    rememberMe
                      ? 'bg-blue-500 border-blue-500'
                      : 'border-gray-300 bg-white'
                  } flex items-center justify-center`}>
                    {rememberMe && (
                      <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <span className="ml-2 text-sm text-gray-600">아이디 저장</span>
                </div>
              </div>

              {/* 로그인 버튼 - 더 부드러운 색상 */}
              <button
                type="submit" // 폼 안에 있으므로 type="submit"으로 충분
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                로그인
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* 추가 링크 - flex-nowrap 추가 및 gap 조정 */}
              <div className="text-center pt-4 border-t border-gray-100">
                <div className="flex justify-center items-center gap-4 text-sm flex-nowrap">
                  <button
                    type="button"
                    onClick={() => alert('아이디 찾기')}
                    className="text-gray-600 hover:text-blue-500 transition-colors font-medium whitespace-nowrap px-2 py-1"
                  >
                    아이디 찾기
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    type="button"
                    onClick={() => alert('비밀번호 찾기')}
                    className="text-gray-600 hover:text-blue-500 transition-colors font-medium whitespace-nowrap px-2 py-1"
                  >
                    비밀번호 찾기
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    type="button"
                    onClick={() => navigate('/signup')}
                    className="text-gray-600 hover:text-blue-500 transition-colors font-medium whitespace-nowrap px-2 py-1"
                  >
                    회원가입
                  </button>
                </div>
              </div>
            </form> {/* </form> 태그 끝 */}
          </div>

          {/* 하단 정보 */}
          <div className="text-center mt-8">
            <p className="text-gray-500 text-sm">
              시스템 문의: <span className="text-blue-500 font-medium">042-481-5000</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}