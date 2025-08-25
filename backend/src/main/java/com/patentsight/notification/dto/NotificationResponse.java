package com.patentsight.notification.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class NotificationResponse {
    private Long notificationId;
    private String notificationType;
    private String message;
    private String targetType;
    private Long targetId;
    private boolean isRead;
    private LocalDateTime createdAt;
}
