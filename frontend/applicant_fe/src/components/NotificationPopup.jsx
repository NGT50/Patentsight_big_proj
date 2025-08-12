import React from 'react';
import { Bell, X, Clock } from 'lucide-react';
import { markAsRead } from '../data/notifications';

const NotificationPopup = ({ isOpen, onClose, notifications, onNotificationUpdate }) => {
  if (!isOpen) return null;

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return '방금 전';
    if (diffInHours < 24) return `${diffInHours}시간 전`;
    if (diffInHours < 48) return '어제';
    return date.toLocaleDateString('ko-KR');
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      try {
        await markAsRead(notification.id);
        // 부모 컴포넌트에 알림 업데이트 알림
        if (onNotificationUpdate) {
          onNotificationUpdate();
        }
      } catch (error) {
        console.error('알림 읽음 처리 실패:', error);
      }
    }
  };

  return (
    <>
      {/* 오버레이 */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-25 z-40"
        onClick={onClose}
      />
      
      {/* 팝업 */}
      <div className="fixed top-16 right-4 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-96 overflow-hidden">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-bold text-gray-800">알림</h3>
            {notifications && notifications.length > 0 && (
              <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                {notifications.length}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>
        
        {/* 알림 목록 */}
        <div className="max-h-80 overflow-y-auto">
          {notifications && notifications.length > 0 ? (
            <div className="p-4 space-y-3">
              {notifications.map((notification, index) => (
                <div
                  key={notification.id || index}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-3 rounded-lg border transition-all hover:shadow-md cursor-pointer ${
                    notification.type === 'warning' 
                      ? 'bg-red-50 border-red-200 hover:bg-red-100' 
                      : notification.type === 'success'
                      ? 'bg-green-50 border-green-200 hover:bg-green-100'
                      : 'bg-blue-50 border-blue-200 hover:bg-blue-100'
                  } ${!notification.read ? 'ring-2 ring-blue-200' : ''}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm font-medium ${
                          notification.type === 'warning' 
                            ? 'text-red-800' 
                            : notification.type === 'success'
                            ? 'text-green-800'
                            : 'text-blue-800'
                        }`}>
                          {notification.message}
                        </p>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                      {notification.deadline && (
                        <p className={`text-xs mt-1 ${
                          notification.type === 'warning' 
                            ? 'text-red-600' 
                            : notification.type === 'success'
                            ? 'text-green-600'
                            : 'text-blue-600'
                        }`}>
                          기한: {notification.deadline}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500">
                        {formatTime(notification.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <Bell className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">새로운 알림이 없습니다.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default NotificationPopup; 