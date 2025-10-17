package com.Backend.services.notification_service;

import com.Backend.services.user_service.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.nio.file.AccessDeniedException;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationController {
    private final NotificationService notificationService;

    @PutMapping("/read")
    public ResponseEntity<Map<String, String>> markSpecificAsRead(@AuthenticationPrincipal User user, @RequestBody AllReadRecord listOfIds) throws AccessDeniedException {
        notificationService.markNotificationAsRead(user, listOfIds.ids());
        return ResponseEntity.ok(Map.of("message", "Marked your specific notifications as read"));
    }

    @PutMapping("/read/{id}")
    public ResponseEntity<Map<String, String>> markAsRead(@AuthenticationPrincipal User user, @PathVariable("id") Long id) throws AccessDeniedException {
        notificationService.markNotificationAsRead(user, id);
        return ResponseEntity.ok(Map.of("message", "Marked notification as read"));
    }


    @PutMapping("/allRead")
    public ResponseEntity<Map<String, String>> markAllAsRead(@AuthenticationPrincipal User user) {
        notificationService.markAllNotificationAsRead(user);
        return ResponseEntity.ok(Map.of("message", "Marked all notifications as read"));
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Map<String, String>> deleteNotification(@AuthenticationPrincipal User user, @PathVariable("id") Long id) throws AccessDeniedException {
        notificationService.deleteNotification(user, id);
        return ResponseEntity.ok(Map.of("message", "Deleted notification"));
    }

    @GetMapping()
    public ResponseEntity<Set<NotificationDTO>> getNotifications(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(notificationService.getNotifications(user));
    }
}
