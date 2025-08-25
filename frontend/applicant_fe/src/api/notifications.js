import axios from './axiosInstance';

// 알림 목록 조회
export const getNotifications = async () => {
  try {
    const response = await axios.get('/api/notifications');
    return response.data;
  } catch (error) {
    console.error('알림 목록 조회 실패:', error);
    throw new Error(error.response?.data?.message || '알림 목록을 불러오는데 실패했습니다.');
  }
};

// 미확인 알림 조회
export const getUnreadNotifications = async () => {
  try {
    const response = await axios.get('/api/notifications/unread');
    return response.data;
  } catch (error) {
    console.error('미확인 알림 조회 실패:', error);
    throw new Error(error.response?.data?.message || '미확인 알림을 불러오는데 실패했습니다.');
  }
};

// 알림 읽음 처리
export const markNotificationAsRead = async (notificationId) => {
  try {
    const response = await axios.patch(`/api/notifications/${notificationId}`, {
      is_read: true
    });
    return response.data;
  } catch (error) {
    console.error('알림 읽음 처리 실패:', error);
    throw new Error(error.response?.data?.message || '알림 읽음 처리에 실패했습니다.');
  }
};

// 알림 삭제
export const deleteNotification = async (notificationId) => {
  try {
    const response = await axios.delete(`/api/notifications/${notificationId}`);
    return response.data;
  } catch (error) {
    console.error('알림 삭제 실패:', error);
    throw new Error(error.response?.data?.message || '알림 삭제에 실패했습니다.');
  }
}; 