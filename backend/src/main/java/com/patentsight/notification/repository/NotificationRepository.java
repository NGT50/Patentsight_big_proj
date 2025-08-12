package com.patentsight.notification.repository;

import com.patentsight.notification.domain.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUser_UserId(Long userId);
    List<Notification> findByUser_UserIdAndIsReadFalse(Long userId);
}
