import React, { useState } from 'react';
import Button from '../components/Button'; // 우리의 공용 버튼 컴포넌트

// onGenerate: 생성 버튼 클릭 시 호출될 함수 (입력된 title 전달)
// onClose: 닫기 버튼 클릭 시 호출될 함수
// isLoading: 생성 중 상태를 받아 버튼을 비활성화
const GenerateDraftModal = ({ onGenerate, onClose, isLoading }) => {
  const [title, setTitle] = useState('');

  const handleGenerateClick = () => {
    if (!title.trim()) {
      alert('아이디어를 입력해주세요.');
      return;
    }
    onGenerate(title);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <h2 className="text-xl font-bold text-gray-800">AI 초안 자동 생성</h2>
        <p className="mt-2 text-sm text-gray-600">발명의 명칭이나 핵심 아이디어를 입력하시면, AI가 전체 문서 초안을 생성해 드립니다.</p>
        
        <div className="my-4">
          <label htmlFor="draft-title" className="block text-sm font-medium text-gray-700">핵심 아이디어</label>
          <input
            id="draft-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="예: 회전 나사 특허"
            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button onClick={onClose} variant="secondary" className="w-auto">취소</Button>
          <Button onClick={handleGenerateClick} disabled={isLoading} variant="primary" className="w-auto">
            {isLoading ? '생성 중...' : '생성하기'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GenerateDraftModal;