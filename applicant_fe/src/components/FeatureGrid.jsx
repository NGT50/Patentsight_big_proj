import React from 'react';
import FeatureButton from './FeatureButton';
import { useNavigate } from 'react-router-dom';
import { createPatent } from '../api/patents';

const FeatureGrid = () => {
  const navigate = useNavigate();

  const handleCreatePatent = async () => {
    try {
      const newPatent = await createPatent({
        title: '새로운 출원서',
        type: 'PATENT', // 기본값은 특허로 고정
      });
      navigate(`/patent/${newPatent.patent_id}`);
    } catch (error) {
      console.error('출원서 생성 실패:', error);
      alert('출원서 생성 중 오류가 발생했습니다.');
    }
  };

  return (
    <div style={{ display: 'flex', gap: '16px', marginTop: '40px', justifyContent: 'center' }}>
      <FeatureButton title="특허, 실용신안 점검" onClick={() => alert("특허 점검 이동")} />
      <FeatureButton title="디자인, 상표 점검" onClick={() => alert("디자인 점검 이동")} />
      <FeatureButton title="특허 보관함" sub="총 출원수: 3건\n보완요청: 1건" onClick={() => alert("보관함 이동")} />
      <FeatureButton title="출원서 등록" onClick={() => navigate('/patents/new')} />
    </div>
  );
};

export default FeatureGrid;
