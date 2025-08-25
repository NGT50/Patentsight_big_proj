package com.patentsight.notification.domain;

import jakarta.persistence.*;
import lombok.*;
import com.patentsight.user.domain.User;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long notificationId;

    private String notificationType;  // 알림 유형
    private String message;           // 알림 내용
    private String targetType;        // 타겟 타입
    private Long targetId;            // 타겟 ID

    private boolean isRead;           // 읽음 여부
    private LocalDateTime createdAt;  // 생성일

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")     // 로그인 사용자
    private User user;
}
