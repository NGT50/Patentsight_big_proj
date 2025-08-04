// src/pages/PatentReview.jsx
import { useParams, useNavigate } from 'react-router-dom'; // useNavigate 추가
import { patentDetailMockData } from '../mocks/patentDetailMock';
import { FileText, Info, MessageSquare, Copy } from 'lucide-react'; // 필요한 아이콘들 추가
import Header from '../components/Header'; // Header 컴포넌트 임포트

export default function PatentReview() {
  const { id } = useParams();
  const navigate = useNavigate(); // useNavigate 훅 사용

  const detail = patentDetailMockData[id];

  if (!detail) {
    return (
      <> {/* Header를 포함하기 위해 Fragment 사용 */}
        <Header />
        <div className="p-8 bg-gradient-to-br from-slate-50 via-pink-50 to-indigo-50 min-h-screen font-sans text-center text-gray-600">
          존재하지 않는 출원번호입니다.
          <div className="mt-8">
            <button
              onClick={() => navigate('/patentdashboard')}
              className="px-6 py-3 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg font-medium transition-all flex items-center gap-2 mx-auto"
            >
              목록으로 돌아가기
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <> {/* Header를 포함하기 위해 Fragment 사용 */}
      <Header /> {/* <-- 여기에 헤더 컴포넌트를 추가합니다. */}
      <div className="p-8 bg-gradient-to-br from-slate-50 via-pink-50 to-indigo-50 min-h-screen font-sans">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-800">
          <FileText className="w-7 h-7 text-indigo-600"/> <span>특허 심사관 의견서</span> {/* 아이콘 변경 */}
        </h2>

        {/* 1. 출원 정보 */}
        <section className="mb-6 border border-gray-200 p-6 rounded-xl bg-white shadow-sm">
          <h3 className="font-semibold text-xl mb-4 text-gray-800 flex items-center gap-2">
            <Info className="w-5 h-5 text-indigo-500" /> 출원 정보
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-gray-700">
            <p><strong>출원번호:</strong> <span className="font-medium text-gray-900">{detail.id}</span></p>
            <p><strong>접수일자:</strong> <span className="font-medium text-gray-900">{detail.receptionDate}</span></p>
            <p><strong>출원인:</strong> <span className="font-medium text-gray-900">{detail.applicant}</span></p>
            <p><strong>출원제목:</strong> <span className="font-medium text-gray-900">{detail.title}</span></p>
            {/* 특허 상태 정보가 있다면 추가할 수 있습니다. 예: <p><strong>심사상태:</strong> <span className="font-semibold text-blue-600">심사중</span></p> */}
          </div>
        </section>

        {/* 2. 심사 대상 (청구항 / 도면 / 요약) */}
        <section className="mb-6 border border-gray-200 p-6 rounded-xl bg-white shadow-sm">
          <h3 className="font-semibold text-xl mb-4 text-gray-800 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-500" /> 심사 대상
          </h3>
          <p className="text-sm text-gray-600 mb-2 font-medium">✨ 청구항:</p>
          <p className="text-base bg-gray-100 p-4 rounded-lg text-gray-800 leading-relaxed mb-6">
            {detail.claim}
          </p>

          <p className="text-sm text-gray-600 mt-4 mb-2 font-medium">🖼️ 도면:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {detail.drawings.length > 0 ? (
              detail.drawings.map((src, i) => (
                <div key={i} className="border border-gray-200 rounded-md overflow-hidden bg-white shadow-sm">
                  <img src={src} alt={`도면 ${i + 1}`} className="w-full h-auto object-cover max-h-64" />
                  <p className="p-2 text-center text-sm text-gray-600 border-t border-gray-100">도면 {i + 1}</p>
                </div>
              ))
            ) : (
              <div className="col-span-full p-4 text-center text-gray-500 bg-gray-50 rounded-lg border border-gray-100">
                제출된 도면이 없습니다.
              </div>
            )}
          </div>

          <p className="text-sm text-gray-600 mt-6 mb-2 font-medium">📝 요약:</p>
          <p className="text-base bg-gray-100 p-4 rounded-lg text-gray-800 leading-relaxed">
            {detail.summary}
          </p>
        </section>

        {/* 3. 심사 의견 작성 */}
        <section className="mb-6 border border-gray-200 p-6 rounded-xl bg-white shadow-sm">
          <h3 className="font-semibold text-xl mb-4 text-gray-800 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-500" /> 심사 의견서
          </h3>
          <textarea
            rows={6}
            className="w-full border border-gray-300 px-4 py-3 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-y"
            placeholder="거절 이유 또는 등록 사유를 작성해주세요."
          />
          <div className="mt-5 flex gap-3 justify-end">
            <button className="px-5 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all font-medium flex items-center gap-2">
              등록 의견 제출
            </button>
            <button className="px-5 py-2 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-lg hover:from-red-600 hover:to-rose-700 transition-all font-medium flex items-center gap-2">
              거절 의견 제출
            </button>
          </div>
        </section>

        {/* 4. 유사 특허 검색 결과 */}
        {detail.similarPatents && detail.similarPatents.length > 0 && (
          <section className="border border-gray-200 p-6 rounded-xl bg-white shadow-sm">
            <h3 className="font-semibold text-xl mb-4 text-gray-800 flex items-center gap-2">
              <Copy className="w-5 h-5 text-indigo-500" /> 유사 특허 검색 결과
            </h3>
            <div className="flex gap-4 overflow-x-auto pb-2 -mx-2 px-2">
              {detail.similarPatents.map((sp) => (
                <div key={sp.id} className="min-w-[200px] w-full max-w-[250px] border border-gray-200 rounded-lg overflow-hidden bg-gray-50 shadow-sm flex-shrink-0">
                  <img src={sp.image} alt={`유사특허 ${sp.id}`} className="w-full h-32 object-cover bg-gray-200" />
                  <div className="p-3">
                    <p className="text-sm font-medium text-gray-800">출원번호: {sp.id}</p>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">{sp.comment}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 목록으로 돌아가기 버튼 (옵션) */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/patentdashboard')}
            className="px-6 py-3 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg font-medium transition-all flex items-center gap-2 mx-auto"
          >
            목록으로 돌아가기
          </button>
        </div>
      </div>
    </>
  );
}