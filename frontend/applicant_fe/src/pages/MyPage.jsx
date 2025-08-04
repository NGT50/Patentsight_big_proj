import React, { useEffect, useState } from 'react';
import '../styles/MyPage.css';
import TopBar from '../components/TopBar';
import FeatureGrid from '../components/FeatureGrid';
import PatentCard from '../components/PatentCard';
import { getMyPatents } from '../api/patents';

const MyPage = () => {
  const [patents, setPatents] = useState([]);

  useEffect(() => {
    async function fetchPatents() {
      try {
        const data = await getMyPatents();
        setPatents(data);
      } catch (err) {
        console.error('출원 목록 불러오기 실패:', err);
      }
    }

    fetchPatents();
  }, []);

  return (
    <div className="mypage-container">
      <TopBar />
      <FeatureGrid />

      <h2 style={{ marginTop: '40px' }}>📄 나의 출원 목록</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '16px' }}>
        {patents.length === 0 ? (
          <p>출원 내역이 없습니다.</p>
        ) : (
          patents.map((p) => <PatentCard key={p.patent_id} patent={p} />)
        )}
      </div>
    </div>
  );
};

export default MyPage;
