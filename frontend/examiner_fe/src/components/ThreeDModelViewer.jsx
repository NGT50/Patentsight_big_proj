import React, { useEffect, useState } from 'react';

/**
 * Authenticated GLB viewer for examiner pages.
 * Always fetches the model through the backend so protected files load correctly.
 */
export default function ThreeDModelViewer({ src }) {
  const [modelUrl, setModelUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

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
    
    // public 폴더의 파일인 경우 직접 URL 사용
    if (src.startsWith('/') && !src.startsWith('/api/')) {
      setModelUrl(src);
      setIsLoading(false);
      setHasError(false);
      return;
    }
    
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
        setIsLoading(false);
        setHasError(false);
      } catch (e) {
        console.error('3D 모델 로드 실패:', e);
        setModelUrl('');
        setIsLoading(false);
        setHasError(true);
      }
    };
    load();
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [src]);

  return (
    <div className="w-full h-72 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 flex items-center justify-center">
      {isLoading && (
        <div className="flex flex-col items-center justify-center text-gray-600">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin mb-2"></div>
          <p className="text-sm">3D 모델 로딩 중...</p>
        </div>
      )}
      
      {hasError && (
        <div className="flex flex-col items-center justify-center text-red-600">
          <p className="text-sm font-medium mb-2">3D 모델 로드 실패</p>
          <p className="text-xs text-gray-500">파일을 확인해주세요</p>
        </div>
      )}
      
      {modelUrl && !isLoading && !hasError && (
        /* @ts-ignore */
        <model-viewer
          style={{ width: '100%', height: '100%', backgroundColor: '#f8f9fa' }}
          src={modelUrl}
          camera-controls
          auto-rotate
          exposure="1.0"
          shadow-intensity="1.0"
          environment-image="neutral"
          shadow-softness="0.5"
          ar
        />
      )}
    </div>
  );
}
