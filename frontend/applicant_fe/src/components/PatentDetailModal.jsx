// src/components/PatentDetailModal.jsx

import React, { useEffect, useState } from 'react';
import { getImageUrlsByIds, getNonImageFilesByIds } from '../api/files';

function ModelViewer3D({ src }) {
  useEffect(() => {
    if (!window.customElements || !window.customElements.get('model-viewer')) {
      const script = document.createElement('script');
      script.type = 'module';
      script.src = 'https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js';
      document.head.appendChild(script);
    }
  }, []);
  return (
    <div style={{ width: '100%', height: '200px', backgroundColor: '#f3f4f6', borderRadius: '8px', overflow: 'hidden' }}>
      {/* @ts-ignore */}
      <model-viewer
        style={{ width: '100%', height: '100%' }}
        src={src}
        camera-controls
        auto-rotate
        exposure="1.0"
        shadow-intensity="1"
        ar
      />
    </div>
  );
}

const PatentDetailModal = ({ patent, onClose }) => {
  const [images, setImages] = useState([]);
  const [glbUrl, setGlbUrl] = useState('');

  useEffect(() => {
    async function loadAttachments() {
      if (patent.attachments && patent.attachments.length > 0) {
        try {
          const [imgs, others] = await Promise.all([
            getImageUrlsByIds(patent.attachments),
            getNonImageFilesByIds(patent.attachments),
          ]);
          setImages(imgs);
          const glb = others.find(
            (f) => /\.glb($|\?|#)/i.test(f.name || '') || /\.glb($|\?|#)/i.test(f.url || '')
          );
          setGlbUrl(glb ? glb.url : '');
        } catch (err) {
          console.error('첨부 파일 로드 실패:', err);
        }
      }
    }
    loadAttachments();
  }, [patent]);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '8px',
          width: '70%',
          maxHeight: '90%',
          overflowY: 'auto',
        }}
      >
        <button onClick={onClose} style={{ float: 'right', fontSize: '18px' }}>
          X
        </button>
        <h2>{patent.title}</h2>
        <img src={patent.image} alt="대표 도면" style={{ width: 300 }} />
        <p>
          <strong>출원번호:</strong> {patent.number}
        </p>
        <p>
          <strong>출원인:</strong> {patent.applicant}
        </p>
        <p>
          <strong>IPC/CPC:</strong> {patent.ipc} / {patent.cpc}
        </p>
        <p>
          <strong>요약:</strong> {patent.summary}
        </p>
        <h3 style={{ marginTop: '16px' }}>도면에 대한 설명</h3>
        {(images.length > 0 || glbUrl) && (
          <div style={{ marginBottom: '16px' }}>
            {images.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                {images.map((src, idx) => (
                  <img
                    key={idx}
                    src={src}
                    alt={`도면 ${idx + 1}`}
                    style={{
                      width: '100px',
                      height: '100px',
                      objectFit: 'contain',
                      border: '1px solid #e5e7eb',
                      borderRadius: '4px',
                    }}
                  />
                ))}
              </div>
            )}
            {glbUrl && (
              <div style={{ marginTop: '16px' }}>
                <ModelViewer3D src={glbUrl} />
              </div>
            )}
          </div>
        )}
        <p>{patent.drawingDescription || 'N/A'}</p>
        {/* 향후: 통합행정정보 테이블, 전문보기 등 추가 */}
      </div>
    </div>
  );
};

export default PatentDetailModal;
