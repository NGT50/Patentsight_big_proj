// SearchResult.jsx

import React, { useState } from 'react';
import PatentCard from '../components/PatentCard';
import PatentDetailModal from '../components/PatentDetailModal';

const SearchResult = () => {
  const [selectedPatent, setSelectedPatent] = useState(null);

  // 필터링 상태값
  const [scope, setScope] = useState('국내'); // '국내' or '해외'
  const [statusFilter, setStatusFilter] = useState({ 전체: true, 등록: false, 거절: false });
  const [sortBy, setSortBy] = useState('기본정렬');

  const dummyPatents = []; // ← 여기에 기존 더미 데이터 삽입

  // 필터 UI 렌더링
  const renderFilterBar = () => (
    <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
      {/* 1-2 국내/해외 버튼 */}
      <div>
        <button onClick={() => setScope('국내')} style={{ backgroundColor: scope === '국내' ? '#ccc' : '#eee' }}>국내</button>
        <button onClick={() => setScope('해외')} style={{ backgroundColor: scope === '해외' ? '#ccc' : '#eee', marginLeft: '4px' }}>해외</button>
      </div>

      {/* 1-3 상태 체크박스 */}
      <div>
        {['전체', '등록', '거절'].map((label) => (
          <label key={label} style={{ marginRight: '8px' }}>
            <input
              type="checkbox"
              checked={statusFilter[label]}
              onChange={() =>
                setStatusFilter((prev) => ({
                  ...prev,
                  [label]: !prev[label],
                }))
              }
            />
            {label}
          </label>
        ))}
      </div>

      {/* 1-4 정렬 기준 */}
      <div>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option>기본정렬</option>
          <option>출원일자</option>
          <option>출원번호</option>
          <option>행정상태</option>
          <option>발명의 명칭</option>
        </select>
      </div>
    </div>
  );

  return (
    <div style={{ padding: '24px' }}>
      <h1>🔍 검색 결과</h1>
      {renderFilterBar()}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '24px' }}>
        {dummyPatents.map((patent) => (
          <PatentCard key={patent.id} data={patent} onClick={() => setSelectedPatent(patent)} />
        ))}
      </div>

      {selectedPatent && (
        <PatentDetailModal patent={selectedPatent} onClose={() => setSelectedPatent(null)} />
      )}
    </div>
  );
};

export default SearchResult;
