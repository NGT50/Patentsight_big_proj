package com.patentsight.notification.service;

import com.patentsight.notification.domain.Notification;
import com.patentsight.notification.dto.NotificationResponse;
import com.patentsight.notification.repository.NotificationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> listNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> getUnreadNotifications(Long userId) {
        return notificationRepository.findByUserIdAndIsReadFalse(userId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public boolean markRead(Long notificationId, boolean isRead) {
        Notification notification = notificationRepository.findById(notificationId).orElse(null);
        if (notification == null) return false;
        notification.setRead(isRead);
        notificationRepository.save(notification);
        return true;
    }

    public boolean deleteNotification(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId).orElse(null);
        if (notification == null) return false;
        notificationRepository.delete(notification);
        return true;
    }

    private NotificationResponse toResponse(Notification notification) {
        NotificationResponse res = new NotificationResponse();
        res.setNotificationId(notification.getNotificationId());
        res.setNotificationType(notification.getNotificationType());
        res.setMessage(notification.getMessage());
        res.setTargetType(notification.getTargetType());
        res.setTargetId(notification.getTargetId());
        res.setRead(notification.isRead());
        res.setCreatedAt(notification.getCreatedAt());
        return res;
    }
}
