import React from 'react';

// 임시 알림 데이터
const mockNotifications = [
  { id: 1, message: '심사관으로부터 보완 요청이 왔습니다.', deadline: '기한: 2025-08-25' },
  { id: 2, message: '특허 최종 심사가 완료되었습니다. 결과를 확인해주세요.' },
];

const NotificationPanel = () => {
  return (
    <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
      <h3 className="text-lg font-bold text-gray-800">🔔 알림</h3>
      <ul className="mt-4 space-y-3">
        {mockNotifications.map(notif => (
          <li key={notif.id} className="text-sm text-gray-700">
            <p>{notif.message}</p>
            {notif.deadline && <p className="text-xs text-red-600">{notif.deadline}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NotificationPanel;