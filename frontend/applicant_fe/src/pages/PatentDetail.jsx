import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPatentDetail, getLatestFile } from '../api/patents';
import { getReviewByPatentId } from '../api/reviews';


const PatentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [patent, setPatent] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [review, setReview] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const detail = await getPatentDetail(id);
        setPatent(detail);

        const file = await getLatestFile(id);
        setFileContent(file?.content || '');

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

  if (!patent) return <div>로딩 중...</div>;

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
      <pre
        style={{
          whiteSpace: 'pre-wrap',
          padding: '16px',
          backgroundColor: '#f9f9f9',
          border: '1px solid #ccc',
          borderRadius: '4px',
          minHeight: '200px',
        }}
      >
        {fileContent}
      </pre>

      <button
        onClick={() => navigate(`/patent/${id}/edit`)}
        style={{ padding: '8px 16px', marginTop: '16px' }}
      >
        출원 편집
      </button>
    </div>
  );
};

export default PatentDetail;
