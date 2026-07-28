package com.tripnest.notification.entity;

public enum NotificationType {
    TRIP_REMINDER,          // Reminder before a trip starts
    ACTIVITY_REMINDER,      // Reminder before an activity
    GROUP_INVITE,           // Invited to a travel group
    TRIP_SHARED,            // A trip was shared with you
    BUDGET_ALERT,           // Budget threshold exceeded
    GENERAL                 // General notification
}
