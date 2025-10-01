package com.Backend.services.notification_service;

import java.util.List;

import com.Backend.services.user_service.model.User;

import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationRepo extends JpaRepository<Notification, Long> {

    List<Notification> findByUser(User user);

    List<Notification> findByUserAndIsRead(User user, boolean isRead);

    List<Notification> findByUserAndType(User user, String type);
    
}
