package com.tripnest.trip.service;

import com.tripnest.exception.BadRequestException;
import com.tripnest.exception.ResourceNotFoundException;
import com.tripnest.trip.dto.ActivityResponse;
import com.tripnest.trip.dto.CreateActivityRequest;
import com.tripnest.trip.dto.UpdateActivityRequest;
import com.tripnest.trip.entity.Activity;
import com.tripnest.trip.entity.Trip;
import com.tripnest.trip.mapper.ActivityMapper;
import com.tripnest.trip.repository.ActivityRepository;
import com.tripnest.trip.repository.TripRepository;
import com.tripnest.notification.service.NotificationService;
import com.tripnest.user.entity.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Set;
import java.util.HashSet;

@Service
public class ActivityServiceImpl implements ActivityService {

    private final ActivityRepository activityRepository;
    private final TripRepository tripRepository;
    private final ActivityMapper activityMapper;
    private final NotificationService notificationService;

    public ActivityServiceImpl(ActivityRepository activityRepository, 
                               TripRepository tripRepository, 
                               ActivityMapper activityMapper,
                               NotificationService notificationService) {
        this.activityRepository = activityRepository;
        this.tripRepository = tripRepository;
        this.activityMapper = activityMapper;
        this.notificationService = notificationService;
    }

    private void sendTripNotification(Trip trip, String actorUsername, String title, String message, String link) {
        Set<User> recipients = new HashSet<>(trip.getTravelers());
        recipients.add(trip.getOwner());
        for (User u : recipients) {
            if (!u.getUsername().equals(actorUsername)) {
                try {
                    notificationService.createNotification(
                        u.getUsername(),
                        title,
                        message,
                        com.tripnest.notification.entity.NotificationType.GENERAL,
                        link
                    );
                } catch (Exception e) {
                    // Ignore
                }
            }
        }
    }

    private Trip getTripAndVerifyAccess(Long tripId, String username) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found with ID: " + tripId));

        boolean isTraveler = trip.getTravelers().stream()
                .anyMatch(u -> u.getUsername().equals(username));

        if (!trip.getOwner().getUsername().equals(username) && !isTraveler) {
            throw new BadRequestException("You do not have permission to modify this trip's activities");
        }

        return trip;
    }

    @Override
    @Transactional
    public ActivityResponse addActivity(Long tripId, CreateActivityRequest request, String username) {
        Trip trip = getTripAndVerifyAccess(tripId, username);

        if (request.getStartTime().isAfter(request.getEndTime())) {
            throw new BadRequestException("Start time cannot be after end time");
        }

        if (request.getActivityDate().isBefore(trip.getStartDate()) || request.getActivityDate().isAfter(trip.getEndDate())) {
            throw new BadRequestException("Activity date must fall within the trip's start and end dates");
        }

        Activity activity = Activity.builder()
                .trip(trip)
                .title(request.getTitle())
                .description(request.getDescription())
                .type(request.getType())
                .activityDate(request.getActivityDate())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .cost(request.getCost())
                .build();

        Activity savedActivity = activityRepository.save(activity);
        sendTripNotification(
            trip,
            username,
            "New Itinerary Activity Added",
            username + " added activity '" + savedActivity.getTitle() + "' to trip '" + trip.getTitle() + "'",
            "/dashboard/itinerary"
        );
        return activityMapper.toResponse(savedActivity);
    }

    @Override
    @Transactional
    public ActivityResponse updateActivity(Long tripId, Long activityId, UpdateActivityRequest request, String username) {
        Trip trip = getTripAndVerifyAccess(tripId, username);

        Activity activity = activityRepository.findById(activityId)
                .orElseThrow(() -> new ResourceNotFoundException("Activity not found with ID: " + activityId));

        if (!activity.getTrip().getId().equals(trip.getId())) {
            throw new BadRequestException("Activity does not belong to the specified trip");
        }

        if (request.getStartTime().isAfter(request.getEndTime())) {
            throw new BadRequestException("Start time cannot be after end time");
        }

        if (request.getActivityDate().isBefore(trip.getStartDate()) || request.getActivityDate().isAfter(trip.getEndDate())) {
            throw new BadRequestException("Activity date must fall within the trip's start and end dates");
        }

        activity.setTitle(request.getTitle());
        activity.setDescription(request.getDescription());
        activity.setType(request.getType());
        activity.setActivityDate(request.getActivityDate());
        activity.setStartTime(request.getStartTime());
        activity.setEndTime(request.getEndTime());
        activity.setCost(request.getCost());

        Activity savedActivity = activityRepository.save(activity);
        sendTripNotification(
            trip,
            username,
            "Itinerary Activity Updated",
            username + " updated activity '" + savedActivity.getTitle() + "' in trip '" + trip.getTitle() + "'",
            "/dashboard/itinerary"
        );
        return activityMapper.toResponse(savedActivity);
    }

    @Override
    @Transactional
    public void deleteActivity(Long tripId, Long activityId, String username) {
        Trip trip = getTripAndVerifyAccess(tripId, username);

        Activity activity = activityRepository.findById(activityId)
                .orElseThrow(() -> new ResourceNotFoundException("Activity not found with ID: " + activityId));

        if (!activity.getTrip().getId().equals(trip.getId())) {
            throw new BadRequestException("Activity does not belong to the specified trip");
        }

        activityRepository.delete(activity);
        sendTripNotification(
            trip,
            username,
            "Itinerary Activity Deleted",
            username + " removed activity '" + activity.getTitle() + "' from trip '" + trip.getTitle() + "'",
            "/dashboard/itinerary"
        );
    }
}
