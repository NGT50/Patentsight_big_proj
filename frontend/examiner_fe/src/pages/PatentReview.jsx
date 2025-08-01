// PatentReview.jsx
import { useParams } from 'react-router-dom';
import { patentDetailMockData } from '../mocks/patentDetailMock';

export default function PatentReview() {
  const { id } = useParams();
  const detail = patentDetailMockData[id];

  if (!detail) return <div className="p-8">존재하지 않는 출원번호입니다.</div>;

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans">
      <h2 className="text-2xl font-bold mb-6">📄 특허 심사관 의견서</h2>

      {/* 출원 정보 */}
      <section className="mb-6 border p-4 rounded bg-white shadow-sm">
        <h3 className="font-semibold text-lg mb-2">출원 정보</h3>
        <p><strong>출원번호:</strong> {detail.id}</p>
        <p><strong>접수일자:</strong> {detail.receptionDate}</p>
        <p><strong>출원인:</strong> {detail.applicant}</p>
        <p><strong>출원제목:</strong> {detail.title}</p>
      </section>

      {/* 청구항 / 도면 / 요약 */}
      <section className="mb-6 border p-4 rounded bg-white shadow-sm">
        <h3 className="font-semibold text-lg mb-2">심사 대상</h3>
        <p className="text-sm text-gray-600 mb-1">📄 청구항:</p>
        <p className="text-sm bg-gray-100 p-2 rounded">{detail.claim}</p>

        <p className="text-sm text-gray-600 mt-4 mb-1">📷 도면:</p>
        <div className="flex gap-4">
          {detail.drawings.map((src, i) => (
            <img key={i} src={src} alt={`도면${i + 1}`} className="w-32 border" />
          ))}
        </div>

        <p className="text-sm text-gray-600 mt-4 mb-1">📝 요약:</p>
        <p className="text-sm bg-gray-100 p-2 rounded">{detail.summary}</p>
      </section>

      {/* 의견 입력 */}
      <section className="mb-6 border p-4 rounded bg-white shadow-sm">
        <h3 className="font-semibold text-lg mb-2">심사 의견서</h3>
        <textarea
          rows={6}
          className="w-full border px-3 py-2 rounded text-sm"
          placeholder="거절 이유 또는 등록 사유를 작성해주세요."
        />
        <div className="mt-4 flex gap-3">
          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">
            등록 의견 제출
          </button>
          <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded">
            거절 의견 제출
          </button>
        </div>
      </section>

      {/* 유사 특허 */}
      {detail.similarPatents.length > 0 && (
        <section className="border p-4 rounded bg-white shadow-sm">
          <h3 className="font-semibold text-lg mb-2">유사 특허 검색 결과</h3>
          <div className="flex gap-4 overflow-x-auto">
            {detail.similarPatents.map((sp) => (
              <div key={sp.id} className="min-w-[180px]">
                <img src={sp.image} alt={`유사특허 ${sp.id}`} className="border w-full" />
                <p className="text-sm mt-1">출원번호: {sp.id}</p>
                <p className="text-xs text-gray-500">{sp.comment}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
