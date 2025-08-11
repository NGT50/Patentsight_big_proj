import React from 'react';

const mockNotifications = [
  { id: 1, message: '심사관으로부터 보완 요청이 왔습니다.', deadline: '기한: 2025-08-25' },
  { id: 2, message: '특허 최종 심사가 완료되었습니다. 결과를 확인해주세요.' },
];

// 팝업 형태로 만들기 위해 스타일을 수정합니다.
const NotificationPanel = () => {
  return (
    <div className="absolute top-16 right-8 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-50">
      <div className="p-4 border-b">
        <h3 className="text-lg font-bold text-gray-800">🔔 알림</h3>
      </div>
      <ul className="py-2">
        {mockNotifications.map((notif, index) => (
          <li 
            key={notif.id} 
            className={`px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 ${index < mockNotifications.length - 1 ? 'border-b' : ''}`}
          >
            <p>{notif.message}</p>
            {notif.deadline && <p className="mt-1 text-xs text-red-600">{notif.deadline}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NotificationPanel;