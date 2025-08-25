// 알림 데이터 관리 (API 연동 + Fallback)
import { getNotifications as fetchNotifications, getUnreadNotifications as fetchUnreadNotifications } from '../api/notifications';

// Fallback 데이터 (API 실패 시 사용)
const fallbackNotifications = [
  {
    notification_id: 1,
    notification_type: 'warning',
    message: '심사관으로부터 보완 요청이 왔습니다.',
    target_type: 'patent',
    target_id: 101,
    is_read: false,
    created_at: '2024-12-20T10:00:00Z'
  },
  {
    notification_id: 2,
    notification_type: 'success',
    message: '특허 최종 심사가 완료되었습니다. 결과를 확인해주세요.',
    target_type: 'patent',
    target_id: 102,
    is_read: false,
    created_at: '2024-12-19T15:30:00Z'
  },
  {
    notification_id: 3,
    notification_type: 'info',
    message: '새로운 특허 검색 결과가 있습니다.',
    target_type: 'search',
    target_id: null,
    is_read: false,
    created_at: '2024-12-18T09:15:00Z'
  }
];

// 알림 타입을 프론트엔드 형식으로 변환
const transformNotification = (notification) => {
  return {
    id: notification.notification_id,
    type: notification.notification_type,
    message: notification.message,
    targetType: notification.target_type,
    targetId: notification.target_id,
    read: notification.is_read,
    timestamp: new Date(notification.created_at)
  };
};

// 알림 목록 조회 (API 우선, 실패 시 Fallback)
export const getNotifications = async () => {
  try {
    const response = await fetchNotifications();
    return response.map(transformNotification);
  } catch (error) {
    console.warn('API 호출 실패, Fallback 데이터 사용:', error);
    return fallbackNotifications.map(transformNotification);
  }
};

// 미확인 알림 개수 조회
export const getUnreadCount = async () => {
  try {
    const response = await fetchUnreadNotifications();
    return response.length;
  } catch (error) {
    console.warn('미확인 알림 API 호출 실패, Fallback 데이터 사용:', error);
    return fallbackNotifications.filter(notification => !notification.is_read).length;
  }
};

// 알림 읽음 처리
export const markAsRead = async (notificationId) => {
  try {
    const response = await import('../api/notifications').then(module => 
      module.markNotificationAsRead(notificationId)
    );
    return response;
  } catch (error) {
    console.warn('알림 읽음 처리 API 호출 실패:', error);
    // Fallback: 로컬에서 읽음 처리
    const notification = fallbackNotifications.find(n => n.notification_id === notificationId);
    if (notification) {
      notification.is_read = true;
    }
  }
};

// 모든 알림 읽음 처리
export const markAllAsRead = async () => {
  try {
    const notifications = await getNotifications();
    const unreadNotifications = notifications.filter(n => !n.read);
    
    // 모든 미확인 알림을 읽음 처리
    await Promise.all(
      unreadNotifications.map(notification => markAsRead(notification.id))
    );
  } catch (error) {
    console.warn('모든 알림 읽음 처리 실패:', error);
    // Fallback: 로컬에서 모든 알림을 읽음 처리
    fallbackNotifications.forEach(notification => {
      notification.is_read = true;
    });
  }
};

// 새 알림 추가 (로컬 테스트용)
export const addNotification = (notification) => {
  const newNotification = {
    notification_id: Date.now(),
    notification_type: notification.type || 'info',
    message: notification.message,
    target_type: notification.targetType || 'general',
    target_id: notification.targetId || null,
    is_read: false,
    created_at: new Date().toISOString()
  };
  
  fallbackNotifications.unshift(newNotification);
  return transformNotification(newNotification);
};

// 알림 삭제
export const deleteNotification = async (notificationId) => {
  try {
    const response = await import('../api/notifications').then(module => 
      module.deleteNotification(notificationId)
    );
    return response;
  } catch (error) {
    console.warn('알림 삭제 API 호출 실패:', error);
    // Fallback: 로컬에서 삭제
    const index = fallbackNotifications.findIndex(n => n.notification_id === notificationId);
    if (index > -1) {
      fallbackNotifications.splice(index, 1);
    }
  }
};

// 알림 초기화
export const clearNotifications = () => {
  fallbackNotifications.length = 0;
}; 