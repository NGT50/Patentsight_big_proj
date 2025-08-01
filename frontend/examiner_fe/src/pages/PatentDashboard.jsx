// src/pages/PatentDashboard.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { patentDetailMockData } from '../mocks/patentDetailMock';
import Header from '../components/Header';

export default function PatentDashboard() {
  const data = Object.values(patentDetailMockData).map((item) => ({
    ...item,
    status: '심사중', // ✅ status가 mock에 없으므로 고정값 부여
  }));

  const [expandedItemId, setExpandedItemId] = useState(null);
  const navigate = useNavigate();

  const handleRowClick = (itemId) => {
    setExpandedItemId(expandedItemId === itemId ? null : itemId);
  };

  const handleDetailClick = (e, itemId) => {
    e.stopPropagation();
    navigate(`/patentreview/${itemId}`);
  };

  return (
    <>
      <Header />
      <div className="p-8 bg-gray-50 min-h-screen font-sans flex justify-center">
        <div className="w-full max-w-6xl">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            📄 <span>특허 심사 현황 조회</span>
          </h2>

          {/* 검색/필터 영역 */}
          <div className="flex gap-2 mb-6 items-center">
            <input
              type="text"
              placeholder="간단한 필터/검색"
              className="border border-gray-300 px-4 py-2 rounded w-full max-w-md"
            />
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
              검색
            </button>
          </div>

          {/* 테이블 리스트 */}
          <div className="bg-white rounded shadow-sm overflow-hidden border border-gray-200">
            {/* 테이블 헤더 */}
            <div
              className="grid bg-gray-100 text-gray-700 font-semibold px-4 py-3 text-sm border-b border-gray-200"
              style={{ gridTemplateColumns: '2fr 1fr 3fr 1fr 1fr 0.8fr' }}
            >
              <div>출원번호</div>
              <div>출원인 이름</div>
              <div>출원제목</div>
              <div>심사상태</div>
              <div>접수일자</div>
              <div className="text-center">상세</div>
            </div>

            {/* 테이블 행 */}
            {data.length > 0 ? (
              data.map((item) => (
                <div key={item.id} className="border-b border-gray-100 last:border-b-0">
                  <div
                    className={`grid px-4 py-3 text-sm cursor-pointer items-center 
                      ${expandedItemId === item.id ? 'bg-blue-50' : 'bg-white hover:bg-gray-50'}`}
                    style={{ gridTemplateColumns: '2fr 1fr 3fr 1fr 1fr 0.8fr' }}
                    onClick={() => handleRowClick(item.id)}
                  >
                    <div className="truncate">{item.id}</div>
                    <div className="truncate">{item.applicant}</div>
                    <div className="truncate">{item.title}</div>
                    <div className="truncate">{item.status}</div>
                    <div className="truncate">{item.receptionDate}</div>
                    <div className="text-center">
                      <button
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs"
                        onClick={(e) => handleDetailClick(e, item.id)}
                      >
                        상세
                      </button>
                    </div>
                  </div>

                  {/* 아코디언 상세 미리보기 */}
                  {expandedItemId === item.id && (
                    <div className="p-4 bg-gray-50 border-t border-gray-200 text-sm animate-fadeIn">
                      <h4 className="font-semibold mb-2">미리보기 상세 정보:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-1 gap-x-4">
                        <p><strong>출원번호:</strong> {item.id}</p>
                        <p><strong>출원인 이름:</strong> {item.applicant}</p>
                        <p><strong>접수일자:</strong> {item.receptionDate}</p>
                        <p className="md:col-span-2"><strong>출원제목:</strong> {item.title}</p>
                        <p><strong>심사상태:</strong> {item.status}</p>
                      </div>
                      <p className="mt-3 text-gray-600">
                        {item.summary || '이곳에 해당 출원에 대한 추가적인 요약 정보나 중요한 메모 등을 표시할 수 있습니다.'}
                      </p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500">
                데이터가 없습니다.
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
