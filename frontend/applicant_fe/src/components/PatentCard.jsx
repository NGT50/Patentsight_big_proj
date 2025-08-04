// src/components/PatentCard.jsx

import React from 'react';

const PatentCard = ({ data, onClick }) => {
  return (
    <div
      onClick={onClick}
      style={{
        border: '1px solid #ccc',
        padding: '16px',
        borderRadius: '8px',
        cursor: 'pointer',
        backgroundColor: '#fafafa',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <img src={data.image} alt="도면" style={{ width: 100, height: 100, marginRight: 16 }} />
        <div>
          <h3>{data.title}</h3>
          <p>
            <strong>IPC:</strong> {data.ipc} | <strong>CPC:</strong> {data.cpc}
          </p>
          <p>
            <strong>출원번호:</strong> {data.number} | <strong>출원일:</strong> {data.date}
          </p>
          <p>
            <strong>출원인:</strong> {data.applicant} | <strong>상태:</strong> {data.status}
          </p>
          <p>📌 <em>{data.summary}</em></p>
        </div>
      </div>
    </div>
  );
};

export default PatentCard;
