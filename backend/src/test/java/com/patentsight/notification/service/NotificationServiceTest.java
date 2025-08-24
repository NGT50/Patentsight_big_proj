package com.patentsight.notification.service;

import com.patentsight.notification.domain.Notification;
import com.patentsight.notification.repository.NotificationRepository;
import com.patentsight.notification.service.impl.NotificationServiceImpl;
import com.patentsight.user.domain.User;
import com.patentsight.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private NotificationServiceImpl notificationService;

    private User user;

    @BeforeEach
    void setup() {
        user = new User();
        user.setUserId(1L);
        user.setName("Tester");
    }

    @Test
    void getNotifications_returnsList() {
        Notification n = Notification.builder()
                .notificationId(1L)
                .notificationType("TYPE")
                .message("msg")
                .targetType("PATENT")
                .targetId(2L)
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .user(user)
                .build();

        when(notificationRepository.findByUser_UserId(1L))
                .thenReturn(Collections.singletonList(n));

        assertEquals(1, notificationService.getNotifications(1L).size());
    }

    @Test
    void markAsRead_updatesEntity() {
        Notification n = Notification.builder()
                .notificationId(1L)
                .isRead(false)
                .user(user)
                .build();

        when(notificationRepository.findById(1L)).thenReturn(Optional.of(n));

        notificationService.markAsRead(1L);

        assertTrue(n.isRead());
        verify(notificationRepository).save(n);
    }

    @Test
    void deleteNotification_removesRecord() {
        notificationService.deleteNotification(1L);
        verify(notificationRepository).deleteById(1L);
    }
}

