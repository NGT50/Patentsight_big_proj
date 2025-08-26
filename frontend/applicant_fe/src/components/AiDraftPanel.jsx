// src/components/AiDraftPanel.jsx

import React, { useState } from 'react';

// onGenerateDraft: 부모(DocumentEditor)로부터 받을 초안 생성 함수
// isLoading: 부모로부터 받을 로딩 상태
const AiDraftPanel = ({ onGenerateDraft, isLoading }) => {
  const [idea, setIdea] = useState('');

  const handleGenerateClick = () => {
    if (!idea.trim()) {
      alert('핵심 아이디어를 입력해주세요.');
      return;
    }
    // 부모로부터 받은 함수를 여기서 호출합니다.
    // idea 값을 넘겨줄 수 있지만, 현재 시연 로직에서는 사용되지 않습니다.
    onGenerateDraft(idea); 
  };

  return (
    <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '16px', marginTop: '24px' }}>
      <h3>🧠 AI 초안 생성기</h3>
      <p style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
        핵심 아이디어를 입력하고 생성 버튼을 누르면 전체 문서가 채워집니다.
      </p>
      
      <div style={{ margin: '16px 0' }}>
        <input
          type="text"
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          placeholder="예: 수술용 로봇 arm"
          style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          disabled={isLoading}
        />
      </div>

      <button 
        onClick={handleGenerateClick} 
        disabled={isLoading}
        style={{ width: '100%', padding: '10px', fontWeight: 'bold' }}
      >
        {isLoading ? '생성 중...' : '전체 문서 초안 생성'}
      </button>
    </div>
  );
};

export default AiDraftPanel;