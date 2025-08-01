// src/pages/DesignDashboard.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';


export default function DesignDashboard() {
  const [data, setData] = useState([
    { id: 'D-2025-00001', applicant: '홍길동', title: '스마트 안경 디자인', status: '심사대기', receptionDate: '2025-07-28' },
    { id: 'D-2025-00002', applicant: '이영희', title: 'AI 스피커 외형 디자인', status: '심사중', receptionDate: '2025-07-27' },
    { id: 'D-2025-00003', applicant: '김철수', title: '접이식 키보드 디자인', status: '심사완료', receptionDate: '2025-07-26' },
  ]);

  const [expandedItemId, setExpandedItemId] = useState(null);

  const handleRowClick = (itemId) => {
    setExpandedItemId(expandedItemId === itemId ? null : itemId);
  };
  
  const navigate = useNavigate(); 

  const handleDetailClick = (e, itemId) => {
    e.stopPropagation();
    navigate(`/designreview/${itemId}`); // ✅ 이동 경로 설정
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans flex justify-center">
      <div className="w-full max-w-6xl">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          🎨 <span>디자인/상표 심사 현황 조회</span>
        </h2>

        {/* 검색 필터 */}
        <div className="flex gap-2 mb-6 items-center justify-between">
          <input
            type="text"
            placeholder="간단한 필터/검색"
            className="border border-gray-300 px-4 py-2 rounded w-full max-w-md"
          />
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
            검색
          </button>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>남은 시간: 58:03</span>
            <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded">
              로그인 유지
            </button>
            <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded">
              로그아웃
            </button>
          </div>
        </div>

        {/* 리스트 */}
        <div className="bg-white rounded shadow-sm overflow-hidden border border-gray-200">
          <div
            className="grid bg-gray-100 text-gray-700 font-semibold px-4 py-3 text-sm border-b border-gray-200"
            style={{ gridTemplateColumns: '2fr 1fr 3fr 1fr 0.8fr' }}
          >
            <div>디자인번호</div>
            <div>출원인</div>
            <div>디자인명</div>
            <div>심사상태</div>
            <div className="text-center">상세</div>
          </div>

          {data.length > 0 ? (
            data.map((item) => (
              <div key={item.id} className="border-b border-gray-100 last:border-b-0">
                <div
                  className={`grid px-4 py-3 text-sm cursor-pointer items-center 
                             ${expandedItemId === item.id ? 'bg-blue-50' : 'bg-white hover:bg-gray-50'}`}
                  style={{ gridTemplateColumns: '2fr 1fr 3fr 1fr 0.8fr' }}
                  onClick={() => handleRowClick(item.id)}
                >
                  <div className="truncate">{item.id}</div>
                  <div className="truncate">{item.applicant}</div>
                  <div className="truncate">{item.title}</div>
                  <div className="truncate">{item.status}</div>
                  <div className="text-center">
                    <button
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs"
                      onClick={(e) => handleDetailClick(e, item.id)}
                    >
                      상세
                    </button>
                  </div>
                </div>

                {/* 미리보기 */}
                {expandedItemId === item.id && (
                  <div className="p-4 bg-gray-50 border-t border-gray-200 text-sm animate-fadeIn">
                    <h4 className="font-semibold mb-2">미리보기 상세 정보:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-1 gap-x-4">
                      <p><strong>디자인번호:</strong> {item.id}</p>
                      <p><strong>출원인:</strong> {item.applicant}</p>
                      <p className="md:col-span-2"><strong>디자인명:</strong> {item.title}</p>
                      <p><strong>심사상태:</strong> {item.status}</p>
                      {item.receptionDate && <p><strong>접수일자:</strong> {item.receptionDate}</p>}
                    </div>
                    <p className="mt-3 text-gray-600">
                      이 디자인에 대한 간단한 설명이나 주요 특징, 이전 심사 내역 요약 등 부가 정보를 표시할 수 있습니다.
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
  );
}
