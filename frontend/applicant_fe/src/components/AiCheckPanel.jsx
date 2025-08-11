// components/AiCheckPanel.jsx
import React, { useState } from 'react';
import axios from 'axios';

const AiCheckPanel = ({ patentId }) => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const handleRunCheck = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. 최신 문서 버전 조회
      const latestRes = await axios.get(`/api/patents/${patentId}/document/latest`);
      const versionId = latestRes.data?.versionNo;

      if (!versionId) throw new Error('버전 정보를 불러올 수 없습니다.');

      // 2. 문서 점검 수행
      const checkRes = await axios.post(`/api/ai/checks`, {
        version_id: versionId
      });
      const checkId = checkRes.data?.check_id;

      if (!checkId) throw new Error('점검 ID가 없습니다.');

      // 3. 점검 결과 조회
      const resultRes = await axios.get(`/api/ai/checks/result/${checkId}`);
      setResults(resultRes.data);
    } catch (err) {
      console.error(err);
      setError('문서 점검 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: '24px', padding: '16px', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h3>🧠 GPT 문서 점검</h3>
      <button onClick={handleRunCheck} disabled={loading} style={{ marginTop: '8px' }}>
        {loading ? '점검 중...' : '문서 점검하기'}
      </button>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {results && (
        <div style={{ marginTop: '16px' }}>
          <p><strong>위험도 점수:</strong> {results.risk_score}</p>
          <ul>
            {results.detailed_results.map((item, index) => (
              <li key={index}>
                <strong>{item.error_type}:</strong> {item.message}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AiCheckPanel;
