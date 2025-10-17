package com.Backend.services.notification_service;

import java.util.List;

import com.Backend.services.user_service.model.User;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

public interface NotificationRepo extends JpaRepository<Notification, Long> {

    List<Notification> findByUser(User user);

    List<Notification> findByUserAndIsRead(User user, boolean isRead);

    List<Notification> findByUserAndType(User user, String type);

    @Transactional
    @Modifying( clearAutomatically = true)
    @Query("UPDATE Notification n SET n.isRead = :status WHERE n.id IN :id")
    int updateNotificationReadStatus(List<Long> id, Boolean status);
    
}
