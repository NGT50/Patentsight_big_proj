// src/components/PatentDetailModal.jsx

import React from 'react';

const PatentDetailModal = ({ patent, onClose }) => {
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center',
    }}>
      <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', width: '70%', maxHeight: '90%', overflowY: 'auto' }}>
        <button onClick={onClose} style={{ float: 'right', fontSize: '18px' }}>X</button>
        <h2>{patent.title}</h2>
        <img src={patent.image} alt="대표 도면" style={{ width: 300 }} />
        <p><strong>출원번호:</strong> {patent.number}</p>
        <p><strong>출원인:</strong> {patent.applicant}</p>
        <p><strong>IPC/CPC:</strong> {patent.ipc} / {patent.cpc}</p>
        <p><strong>요약:</strong> {patent.summary}</p>
        {/* 향후: 통합행정정보 테이블, 전문보기 등 추가 */}
      </div>
    </div>
  );
};

export default PatentDetailModal;
