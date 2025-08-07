// src/components/AiDraftPanel.jsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AiDraftPanel = ({ patentId }) => {
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Draft 목록 불러오기
  const fetchDrafts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/ai/drafts`, {
        params: { patent_id: patentId },
      });
      setDrafts(res.data);
    } catch (err) {
      console.error('초안 불러오기 실패:', err);
      setError('AI 초안 목록을 불러오는 데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 삭제 요청
  const handleDelete = async () => {
    if (!window.confirm('모든 AI 초안을 삭제하시겠습니까?')) return;
    try {
      await axios.delete(`/api/ai/drafts`, {
        params: { patent_id: patentId },
      });
      await fetchDrafts(); // 삭제 후 새로고침
    } catch (err) {
      console.error('초안 삭제 실패:', err);
      alert('AI 초안 삭제에 실패했습니다.');
    }
  };

  useEffect(() => {
    if (patentId) fetchDrafts();
  }, [patentId]);

  return (
    <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '16px', marginTop: '24px' }}>
      <h3>🧠 AI 초안 목록</h3>

      {loading && <p>불러오는 중...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && drafts.length === 0 && <p>생성된 AI 초안이 없습니다.</p>}

      {!loading && drafts.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {drafts.map((draft) => (
            <div
              key={draft.draft_id}
              style={{
                border: '1px solid #ddd',
                borderRadius: '6px',
                padding: '12px',
                backgroundColor: '#f9f9f9',
              }}
            >
              <strong>🗂 타입:</strong> {draft.type} <br />
              <strong>📄 내용 요약:</strong> {draft.content.slice(0, 100)}...
            </div>
          ))}
          <button onClick={handleDelete} style={{ marginTop: '12px', alignSelf: 'flex-end' }}>
            전체 초안 삭제
          </button>
        </div>
      )}
    </div>
  );
};

export default AiDraftPanel;
