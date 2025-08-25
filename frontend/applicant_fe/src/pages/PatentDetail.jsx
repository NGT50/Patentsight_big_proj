import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPatentDetail } from '../api/patents';
import { getReviewByPatentId } from '../api/reviews';
import { getImageUrlsByIds, getNonImageFilesByIds } from '../api/files';

function ModelViewer3D({ src }) {
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
}

const PatentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [patent, setPatent] = useState(null);
  const [review, setReview] = useState(null);
  const [images, setImages] = useState([]);
  const [glbUrl, setGlbUrl] = useState('');

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

        if (detail.attachments && detail.attachments.length > 0) {
          try {
            const [imgs, others] = await Promise.all([
              getImageUrlsByIds(detail.attachments),
              getNonImageFilesByIds(detail.attachments),
            ]);
            setImages(imgs);
            const glb = others.find(
              (f) => /\.glb($|\?|#)/i.test(f.name || '') || /\.glb($|\?|#)/i.test(f.url || '')
            );
            setGlbUrl(glb ? glb.url : '');
          } catch (err) {
            console.error('첨부 파일 로드 실패:', err);
          }
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
  const canEdit = !['SUBMITTED', 'APPROVED', 'REJECTED'].includes(patent.status);
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
                disabled={!canEdit}
                className={`px-4 py-2 text-sm font-semibold text-white rounded-lg transition-all ${
                  canEdit
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                출원 편집
              </button>
            </div>
          </div>
          {showReview && review && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="font-semibold text-gray-700">심사 결과: <span className="font-normal">{review.decision}</span></p>
              <p className="mt-2 text-gray-700 whitespace-pre-wrap">심사 의견: {review.comment}</p>
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
          {(images.length > 0 || glbUrl) && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">첨부 파일</h2>
              <div className="space-y-4">
                {images.length > 0 && (
                  <div className="flex flex-wrap gap-4">
                    {images.map((src, idx) => (
                      <img
                        key={idx}
                        src={src}
                        alt={`attachment-${idx}`}
                        className="max-w-full h-48 object-contain rounded border border-gray-200"
                      />
                    ))}
                  </div>
                )}
                {glbUrl && <ModelViewer3D src={glbUrl} />}
              </div>
            </div>
          )}
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
