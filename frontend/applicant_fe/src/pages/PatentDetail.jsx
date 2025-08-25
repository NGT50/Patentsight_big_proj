import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom'; 
import {
  getPatentDetail,
  getLatestFile,
  updateFileContent,
  submitPatent
} from '../api/patents';
import { getReviewByPatentId } from '../api/reviews';
import { useQueryClient } from '@tanstack/react-query';

const PatentDetail = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();

  const [patent, setPatent] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [fileId, setFileId] = useState(null);
  const [review, setReview] = useState(null);

  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [submitStatus, setSubmitStatus] = useState('');

  // ✅ 제출 요청
  const handleSubmit = async () => {
    setSubmitStatus('');
    try {
      const latestRequest = {
        title: patent?.title || '',
        type: patent?.type || 'PATENT', // 기본값 PATENT
        cpc: patent?.cpc || '',
        inventor: patent?.inventor ?? null,
        technicalField: patent?.technicalField || '',
        backgroundTechnology: patent?.backgroundTechnology || '',
        inventionDetails: patent?.inventionDetails || {
          problemToSolve: '',
          solution: '',
          effect: ''
        },
        summary: patent?.summary || '',
        drawingDescription: patent?.drawingDescription || '',
        claims: patent?.claims?.length ? patent.claims : ['']
      };

      const response = await submitPatent(id, latestRequest);

      setPatent((prev) => ({ ...prev, status: response.status }));
      queryClient.invalidateQueries(['myPatents']);
      setSubmitStatus('✅ 제출 완료되었습니다.');
    } catch (err) {
      console.error('제출 실패:', err);
      setSubmitStatus('❌ 제출에 실패했습니다.');
    } finally {
      setTimeout(() => setSubmitStatus(''), 3000);
    }
  };

  // ✅ 최초 로딩
  useEffect(() => {
    async function fetchData() {
      try {
        const detail = await getPatentDetail(id);
        setPatent(detail);

        const file = await getLatestFile(id);
        setFileContent(file?.content || '');
        setFileId(file?.file_id || null);

        try {
          const reviewData = await getReviewByPatentId(id);
          setReview(reviewData);
        } catch (err) {
          console.error('리뷰 조회 실패:', err);
        }
      } catch (err) {
        console.error('데이터 로드 실패:', err);
      }
    }

    fetchData();
  }, [id]);

  // ✅ 임시 저장
  const handleSave = async () => {
    if (!fileId) return;

    setSaving(true);
    setSaveStatus('');
    try {
      await updateFileContent(fileId, fileContent);
      queryClient.invalidateQueries(['myPatents']);
      setSaveStatus('✅ 임시 저장 완료');
    } catch (err) {
      console.error('임시 저장 실패:', err);
      setSaveStatus('❌ 저장 실패');
    } finally {
      setSaving(false);
      setTimeout(() => setSaveStatus(''), 2000);
    }
  };

  if (!patent) return <div>로딩 중...</div>;

  const isSubmitted = patent.status === 'SUBMITTED';
  const showReview = ['REVIEWING', 'APPROVED', 'REJECTED'].includes(patent.status);

  return (
    <div style={{ padding: '24px' }}>
      <h1>출원 상세: {patent.title}</h1>
      <p>유형: {patent.type}</p>
      <p>상태: {patent.status}</p>
      {showReview && review && (
        <div style={{ marginTop: '12px' }}>
          <p>심사 결과: {review.decision}</p>
          <p>심사 의견: {review.comment}</p>
        </div>
      )}

      <h2>📄 문서 본문</h2>
      <textarea
        value={fileContent}
        onChange={(e) => setFileContent(e.target.value)}
        rows={20}
        disabled={isSubmitted}
        style={{
          width: '100%',
          fontSize: '16px',
          marginBottom: '12px',
          backgroundColor: isSubmitted ? '#f2f2f2' : 'white',
          color: isSubmitted ? '#999' : 'black'
        }}
      />

      <div>
        <button
          onClick={handleSave}
          disabled={saving || isSubmitted}
          style={{ padding: '8px 16px', marginRight: '12px' }}
        >
          {saving ? '저장 중...' : '임시 저장'}
        </button>

        <button
          onClick={handleSubmit}
          disabled={isSubmitted}
          style={{ padding: '8px 16px' }}
        >
          제출
        </button>

        <span style={{ marginLeft: '12px', color: '#444' }}>
          {saveStatus || submitStatus}
        </span>
      </div>
    </div>
  );
};

export default PatentDetail;
