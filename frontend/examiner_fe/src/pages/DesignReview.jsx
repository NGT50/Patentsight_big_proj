// src/pages/DesignReview.jsx
import { useParams } from 'react-router-dom';

export default function DesignReview() {
  const { id } = useParams(); // /review/:id 형태를 가정

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans">
      <h2 className="text-2xl font-bold mb-6">🎨 디자인/상표 심사 의견서</h2>

      {/* 1. 출원 정보 */}
      <section className="mb-6 border p-4 rounded bg-white shadow-sm">
        <h3 className="font-semibold text-lg mb-2">출원 정보</h3>
        <p><strong>출원번호:</strong> {id}</p>
        <p><strong>접수일자:</strong> 2025-07-28</p>
        <p><strong>출원인:</strong> 홍길동</p>
      </section>

      {/* 2. 심사 대상 도면 */}
      <section className="mb-6 border p-4 rounded bg-white shadow-sm">
        <h3 className="font-semibold text-lg mb-2">심사 대상 도면</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <img src="/sample-design1.jpg" alt="디자인 도면1" className="w-full border" />
            <p className="mt-1 text-sm text-center text-gray-600">도면1</p>
          </div>
          <div>
            <img src="/sample-design2.jpg" alt="디자인 도면2" className="w-full border" />
            <p className="mt-1 text-sm text-center text-gray-600">도면2</p>
          </div>
        </div>
      </section>

      {/* 3. 의견 제출 */}
      <section className="mb-6 border p-4 rounded bg-white shadow-sm">
        <h3 className="font-semibold text-lg mb-2">심사 의견 작성</h3>
        <textarea
          rows={6}
          className="w-full border px-3 py-2 rounded text-sm"
          placeholder="거절/등록 이유 및 상세 사유를 작성해주세요."
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

      {/* 4. 유사 디자인 검색 결과 */}
      <section className="border p-4 rounded bg-white shadow-sm">
        <h3 className="font-semibold text-lg mb-2">유사 디자인 검색 결과</h3>
        <div className="flex gap-4 overflow-x-auto">
          {[1, 2, 3].map((i) => (
            <div key={i} className="min-w-[150px]">
              <img src={`/similar${i}.jpg`} alt={`유사디자인${i}`} className="border w-full" />
              <p className="text-sm text-center mt-1">출원번호: D-2023-000{i}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
