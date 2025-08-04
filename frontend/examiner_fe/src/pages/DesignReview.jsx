// src/pages/DesignReview.jsx
import { useParams, useNavigate } from 'react-router-dom'; 
import { Palette, Info, Image, MessageSquare, Copy } from 'lucide-react'; 
import Header from '../components/Header';

export default function DesignReview() {
  const { id } = useParams(); // /review/:id 형태를 가정
  const navigate = useNavigate(); // <-- useNavigate 훅을 사용합니다.

  return (
    <>
    <Header /> 
    <div className="p-8 bg-gradient-to-br from-slate-50 via-pink-50 to-indigo-50 min-h-screen font-sans">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-800">
        <Palette className="w-7 h-7 text-indigo-600"/> <span>디자인/상표 심사 의견서</span>
      </h2>

      {/* 1. 출원 정보 */}
      <section className="mb-6 border border-gray-200 p-6 rounded-xl bg-white shadow-sm">
        <h3 className="font-semibold text-xl mb-4 text-gray-800 flex items-center gap-2">
          <Info className="w-5 h-5 text-indigo-500" /> 출원 정보
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-gray-700">
          <p><strong>출원번호:</strong> <span className="font-medium text-gray-900">{id}</span></p>
          <p><strong>접수일자:</strong> <span className="font-medium text-gray-900">2025-07-28</span></p>
          <p><strong>출원인:</strong> <span className="font-medium text-gray-900">홍길동</span></p>
          {/* 정적인 데이터이므로 여기에 '디자인명'도 추가할 수 있습니다. */}
          <p><strong>디자인명:</strong> <span className="font-medium text-gray-900">새로운 로고 디자인</span></p>
          <p><strong>심사상태:</strong> <span className="font-semibold text-yellow-600">심사중</span></p>
        </div>
      </section>

      {/* 2. 심사 대상 도면 */}
      <section className="mb-6 border border-gray-200 p-6 rounded-xl bg-white shadow-sm">
        <h3 className="font-semibold text-xl mb-4 text-gray-800 flex items-center gap-2">
          <Image className="w-5 h-5 text-indigo-500" /> 심사 대상 도면
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="border border-gray-200 rounded-md overflow-hidden bg-white shadow-sm">
            <img src="/sample-design1.jpg" alt="디자인 도면1" className="w-full h-auto object-cover max-h-64" />
            <p className="p-2 text-center text-sm text-gray-600 border-t border-gray-100">도면 1</p>
          </div>
          <div className="border border-gray-200 rounded-md overflow-hidden bg-white shadow-sm">
            <img src="/sample-design2.jpg" alt="디자인 도면2" className="w-full h-auto object-cover max-h-64" />
            <p className="p-2 text-center text-sm text-gray-600 border-t border-gray-100">도면 2</p>
          </div>
          {/* 필요하면 더 많은 도면 이미지를 추가할 수 있습니다. */}
        </div>
      </section>

      {/* 3. 심사 의견 작성 */}
      <section className="mb-6 border border-gray-200 p-6 rounded-xl bg-white shadow-sm">
        <h3 className="font-semibold text-xl mb-4 text-gray-800 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-indigo-500" /> 심사 의견 작성
        </h3>
        <textarea
          rows={6}
          className="w-full border border-gray-300 px-4 py-3 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-y"
          placeholder="거절/등록 이유 및 상세 사유를 작성해주세요."
        />
        <div className="mt-5 flex gap-3 justify-end"> {/* 버튼을 오른쪽으로 정렬 */}
          <button className="px-5 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all font-medium flex items-center gap-2">
            등록 의견 제출
          </button>
          <button className="px-5 py-2 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-lg hover:from-red-600 hover:to-rose-700 transition-all font-medium flex items-center gap-2">
            거절 의견 제출
          </button>
        </div>
      </section>

      {/* 4. 유사 디자인 검색 결과 */}
      <section className="border border-gray-200 p-6 rounded-xl bg-white shadow-sm">
        <h3 className="font-semibold text-xl mb-4 text-gray-800 flex items-center gap-2">
          <Copy className="w-5 h-5 text-indigo-500" /> 유사 디자인 검색 결과
        </h3>
        <div className="flex gap-4 overflow-x-auto pb-2 -mx-2 px-2"> {/* 스크롤 가능 영역을 위한 패딩 추가 */}
          {[1, 2, 3].map((i) => (
            <div key={i} className="min-w-[200px] w-full max-w-[250px] border border-gray-200 rounded-lg overflow-hidden bg-gray-50 shadow-sm flex-shrink-0">
              <img src={`/similar${i}.jpg`} alt={`유사디자인${i}`} className="w-full h-32 object-cover bg-gray-200" />
              <div className="p-3">
                <p className="text-sm font-medium text-gray-800">출원번호: D-2023-000{i}</p>
                <p className="text-xs text-gray-600 mt-1 line-clamp-2">이 디자인은 기존 {i === 1 ? '스마트폰 케이스' : i === 2 ? '가구 디자인' : '자동차 외관'}과 유사성이 발견됩니다.</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 목록으로 돌아가기 버튼 (옵션) */}
      <div className="mt-8 text-center">
        <button
          onClick={() => navigate('/designdashboard')} 
          className="px-6 py-3 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg font-medium transition-all flex items-center gap-2 mx-auto"
        >
          목록으로 돌아가기
        </button>
      </div>
    </div>
    </>
  );
}