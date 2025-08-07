import React from 'react';
import { useNavigate } from 'react-router-dom';
const PatentCard = ({ data, onClick }) => {
  // 상태에 따라 다른 스타일을 적용하기 위한 객체
  const statusStyles = {
    DRAFT: 'text-yellow-600 bg-yellow-100',
    SUBMITTED: 'text-blue-600 bg-blue-100',
    APPROVED: 'text-green-600 bg-green-100',
    REJECTED: 'text-red-600 bg-red-100',
  };

  return (
    <div
      onClick={() => onClick(data.patentId)}
      className="flex w-full p-4 bg-white border border-gray-200 rounded-lg shadow-sm cursor-pointer hover:bg-gray-50 transition-colors"
    >
      <img 
        src={data.image || 'https://via.placeholder.com/100'} // image 필드는 API 응답에 따라 추가될 수 있음
        alt="도면" 
        className="flex-shrink-0 w-24 h-24 mr-4 bg-gray-200 rounded-md object-cover" 
      />
      <div className="flex flex-col justify-center">
        <h3 className="text-lg font-bold text-gray-800">{data.title || '제목 없음'}</h3>
        <p className="text-xs text-gray-500">
          <strong>IPC:</strong> {data.ipc || 'N/A'} | <strong>CPC:</strong> {data.cpc || 'N/A'}
        </p>
        <p className="text-xs text-gray-500">
          <strong>출원번호:</strong> {data.applicationNumber || 'N/A'} | <strong>출원일:</strong> {data.applicationDate || 'N/A'}
        </p>
        <p className="text-sm text-gray-700">
          {/* API 명세서에 따라 'applicant' 대신 'inventor'를 사용합니다. */}
          <strong>출원인:</strong> {data.inventor || 'N/A'} | <strong>상태:</strong> 
          <span className={`px-2 py-1 ml-1 text-xs font-semibold rounded-full ${statusStyles[data.status] || 'text-gray-600 bg-gray-100'}`}>
            {data.status || 'N/A'}
          </span>
        </p>
        <p className="mt-2 text-sm text-gray-600">📌 <em>{data.summary || '요약 정보가 없습니다.'}</em></p>
      </div>
    </div>
  );
};

export default PatentCard;