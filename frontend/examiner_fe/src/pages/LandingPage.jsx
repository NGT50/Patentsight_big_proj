import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Bot, 
  Shield, 
  Clock, 
  Users, 
  Award, 
  ArrowRight, 
  CheckCircle,
  Zap,
  Target,
  BarChart3,
  Lightbulb,
  Search,
  Filter,
  Eye,
  Gavel
} from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  // 로그인 상태 확인
  const isLoggedIn = () => {
    const token = localStorage.getItem('token');
    const userInfo = localStorage.getItem('userInfo');
    // token이 있거나 userInfo가 있으면 로그인된 것으로 인식
    return token || userInfo;
  };

  const handleStartClick = () => {
    if (isLoggedIn()) {
      // 로그인되어 있으면 사용자의 심사유형에 따라 대시보드로 이동
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      if (userInfo?.patentType === 'design') {
        navigate('/design-dashboard');
      } else {
        navigate('/patent-dashboard');
      }
    } else {
      // 로그인되어 있지 않으면 로그인 페이지로 이동
      navigate('/login');
    }
  };

  const features = [
    {
      icon: <Bot className="w-8 h-8 text-blue-600" />,
      title: "AI 기반 심사 지원",
      description: "인공지능이 도와주는 스마트한 특허 심사 업무"
    },
    {
      icon: <Search className="w-8 h-8 text-green-600" />,
      title: "AI기반반 선행기술 검색",
      description: "AI가 자동으로 관련 선행기술을 검색하고 분석"
    },
    {
      icon: <Clock className="w-8 h-8 text-purple-600" />,
      title: "실시간 업무 관리",
      description: "심사 진행상황을 모니터링하고 관리"
    }
  ];

  const benefits = [
    "AI 기반 자동 선행기술 검색",
    "지속적인 심사 진행상황 모니터링",
    "심사 도구 및 시스템 지원원",
    "간편한 심사 결과 관리",
    "특허 품질 자동 평가",
    "24/7 시스템 지원"
  ];

  const stats = [
    // { label: "다수의 심사건 진행 " },
    { number: "90%", label: "업무 효율성 향상" },
    { number: "24/7", label: "시스템 지원" },
    { number: "60%", label: "심사 시간 단축" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">특허 심사 AI 서비스에 오신 것을 환영합니다</h1>
          </div>
        </div>
      </header>

      {/* 히어로 섹션 */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              AI와 함께하는
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {" "}스마트 특허 심사
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-4xl mx-auto">
              인공지능이 도와주는 특허 심사 시스템으로 더욱 정확하고 효율적인 
              특허 심사 업무를 경험해보세요.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleStartClick}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <span>시작하기</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 통계 섹션 */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 주요 기능 섹션 */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              AI 기반 특허 심사의 혁신
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              최신 인공지능 기술을 활용하여 특허 심사의 모든 과정을 
              더욱 정확하고 효율적으로 만들어드립니다.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200">
                <div className="mb-4 flex justify-center">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">{feature.title}</h3>
                <p className="text-gray-600 text-center">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 업무 프로세스 섹션 */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              스마트한 심사 업무 프로세스
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              AI가 지원하는 효율적인 특허 심사 워크플로우를 경험해보세요.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">1. 자동 선행기술 검색</h3>
              <p className="text-gray-600 text-center">AI가 자동으로 관련 선행기술을 검색하고 분석하여 심사 효율성을 극대화합니다.</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Eye className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">2. 스마트 심사 지원</h3>
              <p className="text-gray-600 text-center">AI가 심사 포인트를 자동으로 분석하고 판단하여 정확한 심사에 도움을 줄 수 있습니다.</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Gavel className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">3. 효율적 결과 관리</h3>
              <p className="text-gray-600 text-center">심사 결과를 체계적으로 관리하고 추적합니다.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 혜택 섹션 */}
      <section className="bg-gradient-to-br from-blue-300 via-purple-500 to-indigo-600 py-20 relative overflow-hidden">
        {/* 배경 장식 요소 추가 */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-200/30 via-purple-400/30 to-indigo-500/30"></div>
        <div className="absolute top-0 left-0 w-72 h-72 bg-white/10 rounded-full -translate-x-36 -translate-y-36"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full translate-x-48 translate-y-48"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              PATENTSIGHT만의 특별한 혜택
            </h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              특허 심사의 모든 과정에서 최고의 서비스를 경험해보세요.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center justify-center space-x-3 bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 hover:bg-white/20 transition-all duration-200">
                <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
                <span className="text-white text-lg font-medium">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA 섹션 */}
      <section className="bg-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            지금 바로 시작하세요
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            AI 기반 특허 심사 시스템으로 더욱 스마트한 특허 심사의 세계로 
            여러분을 초대합니다.
          </p>
          <button
            onClick={handleStartClick}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center justify-center space-x-2 mx-auto"
          >
            <span>시작하기</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>
    </div>
  );
};

export default LandingPage; 