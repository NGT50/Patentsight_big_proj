import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getMyPatents } from '../api/patents';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  FlaskConical,
  Eye,
  Plus,
  Bell
} from 'lucide-react';

// 병합된 컴포넌트들을 import 합니다.
import SearchNavLink from '../components/SearchNavLink';
import PatentListModal from '../components/PatentListModal';

const MyPage = () => {
  const navigate = useNavigate();

  // --- 기능 로직 (jw-front) ---
  const [isModalOpen, setIsModalOpen] = useState(false);

  // '특허 보관함'을 위한 데이터 호출 (모달이 열릴 때만 실행)
  const { 
    data: submittedPatents, 
    isLoading: isLoadingSubmitted, 
    isError: isErrorSubmitted, 
    error: errorSubmitted 
  } = useQuery({
    queryKey: ['mySubmittedPatents'],
    queryFn: () => getMyPatents({ 'status_ne': 'DRAFT' }),
    enabled: isModalOpen,
  });

  // 'DRAFT' 상태의 문서 개수 (점검 페이지용) - 예시
  // 실제로는 이 데이터도 API로 받아와야 합니다.
  const patentDraftCount = 3; 
  const designDraftCount = 1;

  const openPatentListModal = () => setIsModalOpen(true);
  const closePatentListModal = () => setIsModalOpen(false);

  // --- UI 렌더링 (develop-fe2 디자인 기반 + jw-front 기능) ---
  return (
    <>
      {/* '특허 보관함' 모달 렌더링 (jw-front 기능) */}
      {isModalOpen && (
        <PatentListModal 
          onClose={closePatentListModal}
          patents={submittedPatents}
          isLoading={isLoadingSubmitted}
          isError={isErrorSubmitted}
          error={errorSubmitted}
        />
      )}

      <div className="max-w-screen-xl mx-auto px-4 py-8">
        
        {/* 환영 메시지 (develop-fe2 디자인) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">AI와 함께, 출원부터 보완까지 손쉽게</h1>
          <p className="text-gray-600">Patentsight AI 어시스턴트가 복잡한 특허 출원 과정을 도와드립니다.</p>
        </div>

        {/* 대화형 검색 링크 (jw-front 기능) */}
        <SearchNavLink />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 메인 기능 섹션 */}
          <div className="lg:col-span-2">
            {/* 빠른 기능 버튼 (develop-fe2 디자인 + jw-front 네비게이션) */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">바로가기</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button onClick={() => navigate('/check/patents')} className="flex flex-col items-center p-4 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-all group">
                  <FlaskConical className="w-8 h-8 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium text-blue-800 text-center">특허·실용신안 점검</span>
                  <span className="text-xs text-blue-600 mt-1">({patentDraftCount}건 임시저장)</span>
                </button>
                <button onClick={() => navigate('/check/designs')} className="flex flex-col items-center p-4 bg-purple-50 rounded-lg border border-purple-200 hover:bg-purple-100 transition-all group">
                  <Eye className="w-8 h-8 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium text-purple-800 text-center">디자인·상표 점검</span>
                  <span className="text-xs text-purple-600 mt-1">({designDraftCount}건 임시저장)</span>
                </button>
                <button onClick={openPatentListModal} className="flex flex-col items-center p-4 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-all group">
                  <FileText className="w-8 h-8 text-green-600 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium text-green-800 text-center">특허 보관함</span>
                  <span className="text-xs text-green-600 mt-1">(제출 완료 건)</span>
                </button>
                <button onClick={() => navigate('/patents/new')} className="flex flex-col items-center p-4 bg-orange-50 rounded-lg border border-orange-200 hover:bg-orange-100 transition-all group">
                  <Plus className="w-8 h-8 text-orange-600 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium text-orange-800 text-center">출원서 등록</span>
                </button>
              </div>
            </div>
          </div>

          {/* 알림 패널 (develop-fe2 디자인) */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Bell className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-bold text-gray-800">최근 알림</h3>
              </div>
              <div className="space-y-4">
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800 font-medium">심사관으로부터 보완 요청이 왔습니다.</p>
                  <p className="text-xs text-red-600 mt-1">기한: 2025-08-25</p>
                </div>
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">특허 최종 심사가 완료되었습니다.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MyPage;