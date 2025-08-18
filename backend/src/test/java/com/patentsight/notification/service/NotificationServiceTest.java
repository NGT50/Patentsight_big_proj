package com.patentsight.notification.service;

import com.patentsight.notification.domain.Notification;
import com.patentsight.notification.dto.NotificationResponse;
import com.patentsight.notification.repository.NotificationRepository;
import com.patentsight.notification.service.impl.NotificationServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Optional;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    private NotificationServiceImpl notificationService;

    @BeforeEach
    void setup() {
        notificationService = new NotificationServiceImpl(notificationRepository);
    }

    @Test
    void getNotifications_returnsResponses() {
        Notification n = new Notification();
        n.setNotificationId(1L);
        n.setNotificationType("TYPE");
        n.setMessage("msg");
        n.setTargetType("PATENT");
        n.setTargetId(2L);
        n.setRead(false);
        n.setCreatedAt(LocalDateTime.now());
        when(notificationRepository.findByUser_UserId(1L))
                .thenReturn(Collections.singletonList(n));

        List<NotificationResponse> list = notificationService.getNotifications(1L);
        assertEquals(1, list.size());
        assertEquals(1L, list.get(0).getNotificationId());
    }

    @Test
    void markAsRead_updatesEntity() {
        Notification n = new Notification();
        n.setNotificationId(1L);
        n.setRead(false);
        when(notificationRepository.findById(1L)).thenReturn(Optional.of(n));

        notificationService.markAsRead(1L);

        ArgumentCaptor<Notification> captor = ArgumentCaptor.forClass(Notification.class);
        verify(notificationRepository).save(captor.capture());
        assertTrue(captor.getValue().isRead());
    }

    @Test
    void deleteNotification_removesRecord() {
        notificationService.deleteNotification(1L);

        verify(notificationRepository).deleteById(1L);
    }
}
