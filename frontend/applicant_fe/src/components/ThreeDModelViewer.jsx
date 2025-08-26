import React, { useEffect } from 'react';

const ThreeDModelViewer = ({ src }) => {
  // <model-viewer> 웹 컴포넌트를 로드하는 스크립트는 여전히 필요합니다.
  useEffect(() => {
    if (!window.customElements || !window.customElements.get('model-viewer')) {
      const script = document.createElement('script');
      script.type = 'module';
      script.src = 'https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js';
      document.head.appendChild(script);
    }
  }, []);

  // --- 💡 문제가 되던 복잡한 fetch 로직을 전부 제거했습니다 ---

  // src가 없으면 렌더링하지 않음
  if (!src) {
    return (
      <div className="w-full h-72 bg-black rounded-lg border border-gray-200 flex items-center justify-center">
        <p className="text-gray-400">3D 모델이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-72 bg-black rounded-lg overflow-hidden border border-gray-200 flex items-center justify-center">
      {/* @ts-ignore */}
      <model-viewer
        style={{ width: '100%', height: '100%', backgroundColor: '#000' }}
        // --- 💡 부모에게서 받은 src 경로를 그대로 사용합니다 ---
        src={src}
        camera-controls
        auto-rotate
        exposure="1.0" // 노출 값을 조금 높여 더 밝게 보이도록 조정했습니다.
        shadow-intensity="1"
        ar
      />
    </div>
  );
};

export default ThreeDModelViewer;