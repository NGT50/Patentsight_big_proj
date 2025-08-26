import React, { useEffect, useState } from 'react';

/**
 * Authenticated GLB viewer for examiner pages.
 * Always fetches the model through the backend so protected files load correctly.
 */
export default function ThreeDModelViewer({ src }) {
  const [modelUrl, setModelUrl] = useState('');

  // Lazy load <model-viewer>
  useEffect(() => {
    if (!window.customElements || !window.customElements.get('model-viewer')) {
      const script = document.createElement('script');
      script.type = 'module';
      script.src = 'https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js';
      document.head.appendChild(script);
    }
  }, []);

  useEffect(() => {
    if (!src) return;
    let objectUrl;
    const load = async () => {
      try {
        const token =
          localStorage.getItem('token') ||
          localStorage.getItem('accessToken') ||
          sessionStorage.getItem('token') ||
          sessionStorage.getItem('accessToken') || '';
        const apiBase = import.meta.env.VITE_SPRING_API_URL || 'http://35.175.253.22:8080';
        const target = src.startsWith('http') ? src : `${apiBase}${src}`;
        const res = await fetch(target, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          credentials: 'include',
        });
        if (!res.ok) throw new Error('GLB fetch failed');
        const ct = res.headers.get('content-type') || '';
        if (!/model\/gltf-binary|application\/octet-stream/.test(ct)) {
          throw new Error(`Unexpected content-type: ${ct}`);
        }
        const blob = await res.blob();
        objectUrl = URL.createObjectURL(blob);
        setModelUrl(objectUrl);
      } catch (e) {
        console.error('3D 모델 로드 실패:', e);
        setModelUrl('');
      }
    };
    load();
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [src]);

  return (
    <div className="w-full h-72 bg-black rounded-lg overflow-hidden border border-gray-200 flex items-center justify-center">
      {/* @ts-ignore */}
      <model-viewer
        style={{ width: '100%', height: '100%', backgroundColor: '#000' }}
        src={modelUrl}
        camera-controls
        auto-rotate
        exposure="-2.5"
        shadow-intensity="1"
        ar
      />
    </div>
  );
}
