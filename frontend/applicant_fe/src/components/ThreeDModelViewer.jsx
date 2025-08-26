import React, { useEffect } from 'react';

const ThreeDModelViewer = ({ src }) => {
  useEffect(() => {
    if (!window.customElements || !window.customElements.get('model-viewer')) {
      const script = document.createElement('script');
      script.type = 'module';
      script.src = 'https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js';
      document.head.appendChild(script);
    }
  }, []);

  return (
    <div className="w-full h-72 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 flex items-center justify-center">
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
};

export default ThreeDModelViewer;
