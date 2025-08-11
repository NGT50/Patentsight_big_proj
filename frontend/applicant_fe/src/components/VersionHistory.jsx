import React, { useEffect, useState } from 'react';
import { getDocumentVersions, restoreDocumentVersion } from '../api/patents';

const VersionHistory = ({ patentId }) => {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);

  // 📌 문서 버전 목록 조회
  const fetchVersions = async () => {
    try {
      const res = await getDocumentVersions(patentId);
      setVersions(res);
    } catch (err) {
      console.error(err);
      alert('버전 목록 불러오기 실패');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (patentId) {
      fetchVersions();
    }
  }, [patentId]);

  // 📌 특정 버전 복원
  const handleRestore = async (versionId, versionNo) => {
    const confirmed = window.confirm(
      `버전 ${versionNo}을 복원하시겠습니까?\n기존 문서를 기반으로 새 버전이 생성됩니다.`
    );
    if (!confirmed) return;

    try {
      const res = await restoreDocumentVersion(versionId);
      alert(`버전 ${versionNo}이 복원되어 새 버전(${res.newVersionNo})이 생성되었습니다.`);
      fetchVersions(); // 목록 갱신
    } catch (err) {
      console.error(err);
      alert('복원 실패');
    }
  };

  if (loading) return <div>버전 정보를 불러오는 중...</div>;

  return (
    <div style={{ marginTop: '32px' }}>
      <h2>📜 문서 버전 기록</h2>
      <ul style={{ padding: 0, listStyle: 'none' }}>
        {versions.map((ver) => (
          <li
            key={ver.versionId}
            style={{
              padding: '12px',
              marginBottom: '8px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              backgroundColor: ver.current ? '#f0f8ff' : 'white',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <strong>v{ver.versionNo}</strong> - {ver.changeSummary || '요약 없음'} <br />
              <small>작성일: {new Date(ver.createdAt).toLocaleString()}</small>
            </div>
            {!ver.current && (
              <button onClick={() => handleRestore(ver.versionId, ver.versionNo)}>🔁 복원</button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default VersionHistory;
