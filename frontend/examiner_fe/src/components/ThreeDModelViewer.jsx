import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF, OrbitControls, Environment } from '@react-three/drei';

// GLB 모델을 로드하고 렌더링하는 컴포넌트
function Model({ modelPath }) {
  const { scene } = useGLTF(modelPath);
  return <primitive object={scene} scale={2.80} />; // 모델 크기 조절 (필요에 따라 조절)
}

export default function ThreeDModelViewer({ glbPath }) {
  return (
    <div className="w-full h-[400px] bg-gray-100 rounded-lg overflow-hidden relative border border-gray-200">
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        {/* AmbientLight: 전반적인 빛 */}
        <ambientLight intensity={0.5} />
        {/* DirectionalLight: 특정 방향에서 오는 빛 (그림자 생성 가능) */}
        <directionalLight position={[2, 2, 2]} intensity={1} />
        
        {/* Suspense: 모델 로딩 중 폴백 UI 표시 */}
        <Suspense fallback={<Html center><p className="text-gray-600 text-lg">3D 모델 로딩 중...</p></Html>}>
          <Model modelPath={glbPath} />
        </Suspense>
        
        {/* OrbitControls: 마우스로 모델을 회전, 확대/축소 가능하게 함 */}
        <OrbitControls enableZoom enablePan enableRotate />
        
        {/* Environment: 주변 환경 맵 (선택 사항, 모델의 재질에 따라 반사 효과 추가) */}
        {/* <Environment preset="sunset" background /> */} {/* 'sunset', 'dawn', 'warehouse' 등 다양한 프리셋 */}
      </Canvas>
      <p className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-gray-500 bg-white bg-opacity-75 px-2 py-1 rounded">
        마우스로 드래그하여 3D 모델을 회전, 확대/축소하세요.
      </p>
    </div>
  );
}

// Html 컴포넌트는 @react-three/drei 에서 임포트합니다. 
// Suspense fallback에 HTML 요소를 렌더링하기 위함
import { Html } from '@react-three/drei';