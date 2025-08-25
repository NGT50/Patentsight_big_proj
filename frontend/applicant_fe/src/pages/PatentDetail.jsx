import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPatentDetail } from '../api/patents';
import { getReviewByPatentId } from '../api/reviews';

const PatentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [patent, setPatent] = useState(null);
  const [review, setReview] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const detail = await getPatentDetail(id);
        setPatent(detail);

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
  const statusStyles = {
    DRAFT: 'text-yellow-600 bg-yellow-100',
    SUBMITTED: 'text-blue-600 bg-blue-100',
    REVIEWING: 'text-purple-600 bg-purple-100',
    APPROVED: 'text-green-600 bg-green-100',
    REJECTED: 'text-red-600 bg-red-100',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-screen-xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{patent.title || '제목 없음'}</h1>
              <p className="text-gray-600 mt-1">출원 상세보기</p>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${statusStyles[patent.status] || 'text-gray-600 bg-gray-100'}`}
              >
                {patent.status}
              </span>
              <button
                onClick={() => navigate(`/patent/${id}/edit`)}
                className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all"
              >
                출원 편집
              </button>
            </div>
          </div>
          {showReview && review && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="font-semibold text-gray-700">심사 결과: <span className="font-normal">{review.decision}</span></p>
              <p className="mt-2 text-gray-700">심사 의견: {review.comment}</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">기술분야</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{patent.technicalField || 'N/A'}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">배경기술</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{patent.backgroundTechnology || 'N/A'}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">발명의 상세한 설명</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-md font-medium text-gray-700 mb-1">해결하려는 과제</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{patent.inventionDetails?.problemToSolve || 'N/A'}</p>
              </div>
              <div>
                <h3 className="text-md font-medium text-gray-700 mb-1">과제의 해결 수단</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{patent.inventionDetails?.solution || 'N/A'}</p>
              </div>
              <div>
                <h3 className="text-md font-medium text-gray-700 mb-1">발명의 효과</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{patent.inventionDetails?.effect || 'N/A'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">요약</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{patent.summary || 'N/A'}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">도면의 간단한 설명</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{patent.drawingDescription || 'N/A'}</p>
          </div>

          {patent.claims && patent.claims.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">청구범위</h2>
              <div className="space-y-4">
                {patent.claims.map((claim, index) => (
                  <p key={index} className="text-gray-700 whitespace-pre-wrap">
                    <span className="font-semibold">청구항 {index + 1}:</span> {claim}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatentDetail;
