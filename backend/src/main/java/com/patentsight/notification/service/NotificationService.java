package com.patentsight.notification.service;

import com.patentsight.notification.dto.NotificationRequest;
import com.patentsight.notification.dto.NotificationResponse;

import java.util.List;

public interface NotificationService {
    NotificationResponse createNotification(NotificationRequest request);
    List<NotificationResponse> getNotifications(Long userId);
    List<NotificationResponse> getUnreadNotifications(Long userId);
    void markAsRead(Long notificationId);
    void deleteNotification(Long notificationId);
}