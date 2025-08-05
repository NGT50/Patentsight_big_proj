package com.patentsight.notification.controller;

import com.patentsight.notification.dto.NotificationRequest;
import com.patentsight.notification.dto.NotificationResponse;
import com.patentsight.notification.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public ResponseEntity<List<NotificationResponse>> listNotifications() {
        List<NotificationResponse> list = notificationService.listNotifications(1L);
        return ResponseEntity.ok(list);
    }

    @GetMapping("/unread")
    public ResponseEntity<List<NotificationResponse>> getUnreadNotifications() {
        List<NotificationResponse> list = notificationService.getUnreadNotifications(1L);
        return ResponseEntity.ok(list);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<Map<String, Boolean>> markRead(@PathVariable("id") Long id,
                                                         @RequestBody NotificationRequest request) {
        boolean success = notificationService.markRead(id, request.isRead());
        return ResponseEntity.ok(Collections.singletonMap("success", success));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Boolean>> deleteNotification(@PathVariable("id") Long id) {
        boolean success = notificationService.deleteNotification(id);
        return ResponseEntity.ok(Collections.singletonMap("success", success));
    }
}
