import React from 'react';
import { useNavigate } from 'react-router-dom';
import FeatureButton from './FeatureButton';

// onOpenPatentList 함수를 props로 받습니다.
const FeatureGrid = ({ onOpenPatentList }) => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <FeatureButton title="특허, 실용신안 점검" onClick={() => navigate('/check/patents')} />
      <FeatureButton title="디자인, 상표 점검" onClick={() => navigate('/check/designs')} />
      {/* '특허 보관함' 버튼 클릭 시, 부모로부터 받은 onOpenPatentList 함수를 호출합니다. */}
      <FeatureButton 
        title="특허 보관함"  
        onClick={onOpenPatentList} 
      />
      <FeatureButton title="출원서 등록" onClick={() => navigate('/patents/new')} />
    </div>
  );
};

export default FeatureGrid;