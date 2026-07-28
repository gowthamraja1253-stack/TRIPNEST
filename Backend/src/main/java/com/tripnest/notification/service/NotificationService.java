package com.tripnest.notification.service;

import com.tripnest.notification.dto.NotificationDto;
import com.tripnest.notification.entity.NotificationType;

import java.util.List;

public interface NotificationService {
    void createNotification(String username, String title, String message, NotificationType type, String link);
    List<NotificationDto> getUserNotifications(String username);
    List<NotificationDto> getUnreadNotifications(String username);
    long getUnreadCount(String username);
    void markAsRead(Long notificationId, String username);
    void markAllAsRead(String username);
    void deleteNotification(Long notificationId, String username);
}
