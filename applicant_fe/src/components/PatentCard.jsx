import React from 'react';

const PatentCard = ({ data, onClick }) => {
  // 임시 데이터. 추후 API 응답에 맞춰 수정 필요.
  const patent = {
    image: 'https://via.placeholder.com/100', // 임시 이미지
    title: data.title || '제목 없음',
    ipc: data.ipc || 'N/A',
    cpc: data.cpc || 'N/A',
    number: data.applicationNumber || data.patentId || 'N/A',
    date: data.applicationDate || 'N/A',
    applicant: data.inventor || 'N/A',
    status: data.status || 'N/A',
    summary: data.summary || '요약 정보가 없습니다.'
  };

  return (
    // 인라인 스타일을 모두 Tailwind 클래스로 교체
    <div
      onClick={() => onClick(data.patentId)}
      className="flex w-full p-4 bg-white border border-gray-200 rounded-lg shadow-sm cursor-pointer hover:bg-gray-50"
    >
      <img src={patent.image} alt="도면" className="flex-shrink-0 w-24 h-24 mr-4 bg-gray-200 rounded-md object-cover" />
      <div className="flex flex-col justify-center">
        <h3 className="text-lg font-bold text-gray-800">{patent.title}</h3>
        <p className="text-xs text-gray-500">
          <strong>IPC:</strong> {patent.ipc} | <strong>CPC:</strong> {patent.cpc}
        </p>
        <p className="text-xs text-gray-500">
          <strong>출원번호:</strong> {patent.number} | <strong>출원일:</strong> {patent.date}
        </p>
        <p className="text-sm text-gray-700">
          <strong>출원인:</strong> {patent.applicant} | <strong className="font-semibold text-blue-600">{patent.status}</strong>
        </p>
        <p className="mt-2 text-sm text-gray-600">📌 <em>{patent.summary}</em></p>
      </div>
    </div>
  );
};

export default PatentCard;