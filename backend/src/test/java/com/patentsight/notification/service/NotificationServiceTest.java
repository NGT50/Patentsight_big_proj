package com.patentsight.notification.service;

import com.patentsight.notification.domain.Notification;
import com.patentsight.notification.dto.NotificationResponse;
import com.patentsight.notification.repository.NotificationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
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

    @InjectMocks
    private NotificationService notificationService;

    @BeforeEach
    void setup() {
        notificationService = new NotificationService(notificationRepository);
    }

    @Test
    void listNotifications_returnsResponses() {
        Notification n = new Notification();
        n.setNotificationId(1L);
        n.setUserId(1L);
        n.setNotificationType("TYPE");
        n.setMessage("msg");
        n.setTargetType("PATENT");
        n.setTargetId(2L);
        n.setRead(false);
        n.setCreatedAt(LocalDateTime.now());
        when(notificationRepository.findByUserIdOrderByCreatedAtDesc(1L))
                .thenReturn(Collections.singletonList(n));

        List<NotificationResponse> list = notificationService.listNotifications(1L);
        assertEquals(1, list.size());
        assertEquals(1L, list.get(0).getNotificationId());
    }

    @Test
    void markRead_updatesEntity() {
        Notification n = new Notification();
        n.setNotificationId(1L);
        n.setRead(false);
        when(notificationRepository.findById(1L)).thenReturn(Optional.of(n));
        when(notificationRepository.save(any(Notification.class))).thenAnswer(i -> i.getArgument(0));

        boolean result = notificationService.markRead(1L, true);

        assertTrue(result);
        ArgumentCaptor<Notification> captor = ArgumentCaptor.forClass(Notification.class);
        verify(notificationRepository).save(captor.capture());
        assertTrue(captor.getValue().isRead());
    }

    @Test
    void deleteNotification_removesRecord() {
        Notification n = new Notification();
        n.setNotificationId(1L);
        when(notificationRepository.findById(1L)).thenReturn(Optional.of(n));

        boolean deleted = notificationService.deleteNotification(1L);

        assertTrue(deleted);
        verify(notificationRepository).delete(n);
    }
}
