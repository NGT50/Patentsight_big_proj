package com.patentsight.notification.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor      // 기본 생성자
@AllArgsConstructor     // 모든 필드 생성자
@Builder                // ✅ builder() 메서드 생성
public class NotificationRequest {
    private Long userId;
    private String notificationType;
    private String message;
    private String targetType;
    private Long targetId;
}
