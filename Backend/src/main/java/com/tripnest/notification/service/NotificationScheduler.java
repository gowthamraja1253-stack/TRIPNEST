package com.tripnest.notification.service;

import com.tripnest.notification.entity.NotificationType;
import com.tripnest.trip.entity.Activity;
import com.tripnest.trip.entity.Trip;
import com.tripnest.trip.entity.TripStatus;
import com.tripnest.trip.repository.ActivityRepository;
import com.tripnest.trip.repository.TripRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@Slf4j
public class NotificationScheduler {

    private final TripRepository tripRepository;
    private final ActivityRepository activityRepository;
    private final NotificationService notificationService;

    public NotificationScheduler(TripRepository tripRepository,
                                 ActivityRepository activityRepository,
                                 NotificationService notificationService) {
        this.tripRepository = tripRepository;
        this.activityRepository = activityRepository;
        this.notificationService = notificationService;
    }

    // Run every day at 8:00 AM server time to check for trips starting tomorrow
    @Scheduled(cron = "0 0 8 * * ?")
    public void scheduleTripReminders() {
        log.info("Running daily check for upcoming trips...");
        LocalDate tomorrow = LocalDate.now().plusDays(1);
        
        List<Trip> upcomingTrips = tripRepository.findByStartDateAndStatus(tomorrow, TripStatus.PLANNED);
        
        for (Trip trip : upcomingTrips) {
            String title = "Upcoming Trip Reminder!";
            String message = "Your trip '" + trip.getTitle() + "' to " + trip.getDestination().getName() + " starts tomorrow! Pack your bags!";
            String link = "/dashboard/trips/" + trip.getId();

            trip.getTravelers().forEach(traveler -> {
                notificationService.createNotification(
                        traveler.getUsername(),
                        title,
                        message,
                        NotificationType.TRIP_REMINDER,
                        link
                );
            });
        }
    }

    // Run every hour to check for activities starting in exactly 1 hour
    @Scheduled(cron = "0 0 * * * ?")
    public void scheduleActivityReminders() {
        log.info("Running hourly check for upcoming activities...");
        LocalDate today = LocalDate.now();
        LocalTime nowHour = LocalTime.now().truncatedTo(ChronoUnit.HOURS);
        LocalTime nextHour = nowHour.plusHours(1);

        // This requires an appropriate repository method. For simplicity, we'll fetch all for today and filter.
        // A real implementation should query the DB for efficiency.
        List<Activity> todayActivities = activityRepository.findByActivityDate(today);

        for (Activity activity : todayActivities) {
            if (activity.getStartTime() != null) {
                LocalTime activityHour = activity.getStartTime().truncatedTo(ChronoUnit.HOURS);
                if (activityHour.equals(nextHour)) {
                    Trip trip = activity.getTrip();
                    String title = "Upcoming Activity!";
                    String message = "Your activity '" + activity.getTitle() + "' starts in 1 hour.";
                    String link = "/dashboard/itinerary/activity/" + activity.getId();

                    trip.getTravelers().forEach(traveler -> {
                        notificationService.createNotification(
                                traveler.getUsername(),
                                title,
                                message,
                                NotificationType.ACTIVITY_REMINDER,
                                link
                        );
                    });
                }
            }
        }
    }
}
