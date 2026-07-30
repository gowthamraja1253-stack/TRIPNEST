package com.tripnest.trip.service;

import com.tripnest.exception.BadRequestException;
import com.tripnest.exception.ResourceNotFoundException;
import com.tripnest.trip.dto.CreateTripRequest;
import com.tripnest.trip.dto.TripResponse;
import com.tripnest.trip.dto.UpdateTripRequest;
import com.tripnest.trip.dto.ShareTripRequest;
import com.tripnest.trip.dto.TripTimelineResponse;
import com.tripnest.trip.dto.TimelineDayResponse;
import com.tripnest.trip.entity.Destination;
import com.tripnest.trip.entity.Trip;
import com.tripnest.trip.entity.TripStatus;
import com.tripnest.trip.entity.Activity;
import com.tripnest.trip.dto.ActivityResponse;
import com.tripnest.trip.mapper.TripMapper;
import com.tripnest.trip.mapper.ActivityMapper;
import com.tripnest.trip.repository.DestinationRepository;
import com.tripnest.trip.repository.ActivityRepository;
import com.tripnest.trip.repository.TripRepository;
import com.tripnest.user.entity.User;
import com.tripnest.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;

@Service
public class TripServiceImpl implements TripService {

    private final TripRepository tripRepository;
    private final UserRepository userRepository;
    private final DestinationRepository destinationRepository;
    private final ActivityRepository activityRepository;
    private final com.tripnest.trip.repository.TripDocumentRepository tripDocumentRepository;
    private final TripMapper tripMapper;
    private final ActivityMapper activityMapper;
    private final LlmDestinationService llmDestinationService;
    private final UnsplashService unsplashService;

    public TripServiceImpl(TripRepository tripRepository, UserRepository userRepository,
                           DestinationRepository destinationRepository, ActivityRepository activityRepository,
                           com.tripnest.trip.repository.TripDocumentRepository tripDocumentRepository,
                           TripMapper tripMapper, ActivityMapper activityMapper, LlmDestinationService llmDestinationService,
                           UnsplashService unsplashService) {
        this.tripRepository = tripRepository;
        this.userRepository = userRepository;
        this.destinationRepository = destinationRepository;
        this.activityRepository = activityRepository;
        this.tripDocumentRepository = tripDocumentRepository;
        this.tripMapper = tripMapper;
        this.activityMapper = activityMapper;
        this.llmDestinationService = llmDestinationService;
        this.unsplashService = unsplashService;
    }

    /**
     * Resolves a Destination by name (case-insensitive). If it doesn't exist,
     * a new Destination record is automatically created so users can plan trips
     * to any location worldwide.
     */
    private Destination resolveDestination(String destinationName) {
        return destinationRepository.findByNameIgnoreCase(destinationName.trim())
                .orElseGet(() -> {
                    LlmDestinationService.LlmDestinationData data = llmDestinationService.getDestinationData(destinationName.trim());
                    String imageUrl = unsplashService.getDestinationImageUrl(destinationName.trim());
                    
                    Destination newDest = Destination.builder()
                            .name(destinationName.trim())
                            .country(data.country)
                            .description(data.description)
                            .attractions(data.attractions)
                            .popular(false)
                            .imageUrl(imageUrl)
                            .build();
                    return destinationRepository.save(newDest);
                });
    }

    @Override
    @Transactional
    public TripResponse createTrip(CreateTripRequest request, String ownerUsername) {
        User owner = userRepository.findByUsername(ownerUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + ownerUsername));

        Destination destination = resolveDestination(request.getDestinationName());

        if (request.getStartDate().isAfter(request.getEndDate())) {
            throw new BadRequestException("Start date cannot be after end date");
        }

        Trip trip = Trip.builder()
                .title(request.getTitle())
                .destination(destination)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .budget(request.getBudget())
                .status(TripStatus.PLANNED)
                .owner(owner)
                .travelers(new HashSet<>())
                .build();

        // The owner is automatically the first traveler of the trip
        trip.getTravelers().add(owner);

        Trip savedTrip = tripRepository.save(trip);
        return tripMapper.toResponse(savedTrip);
    }

    @Override
    @Transactional
    public TripResponse updateTrip(Long id, UpdateTripRequest request, String username) {
        Trip trip = tripRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found with ID: " + id));

        if (!trip.getOwner().getUsername().equals(username)) {
            throw new BadRequestException("You do not have permission to modify this trip");
        }

        Destination destination = resolveDestination(request.getDestinationName());

        if (request.getStartDate().isAfter(request.getEndDate())) {
            throw new BadRequestException("Start date cannot be after end date");
        }

        trip.setTitle(request.getTitle());
        trip.setDestination(destination);
        trip.setStartDate(request.getStartDate());
        trip.setEndDate(request.getEndDate());
        trip.setBudget(request.getBudget());
        trip.setStatus(request.getStatus());

        Trip savedTrip = tripRepository.save(trip);
        return tripMapper.toResponse(savedTrip);
    }

    @Override
    @Transactional
    public void deleteTrip(Long id, String username) {
        Trip trip = tripRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found with ID: " + id));

        if (!trip.getOwner().getUsername().equals(username)) {
            throw new BadRequestException("You do not have permission to delete this trip");
        }

        tripRepository.delete(trip);
    }

    @Override
    @Transactional(readOnly = true)
    public TripResponse getTripDetails(Long id, String username) {
        Trip trip = tripRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found with ID: " + id));

        boolean isTraveler = trip.getTravelers().stream()
                .anyMatch(u -> u.getUsername().equals(username));

        if (!trip.getOwner().getUsername().equals(username) && !isTraveler) {
            throw new BadRequestException("You do not have permission to view this trip");
        }

        return tripMapper.toResponse(trip);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TripResponse> getUserTrips(String username) {
        List<Trip> trips = tripRepository.findAllByUser(username);
        return tripMapper.toResponseList(trips);
    }

    @Override
    @Transactional
    public void shareTrip(Long id, ShareTripRequest request, String ownerUsername) {
        Trip trip = tripRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found with ID: " + id));

        if (!trip.getOwner().getUsername().equals(ownerUsername)) {
            throw new BadRequestException("Only the trip owner can share the trip");
        }

        User targetUser = userRepository.findByUsername(request.getUsernameOrEmail())
                .or(() -> userRepository.findByEmail(request.getUsernameOrEmail()))
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username/email: " + request.getUsernameOrEmail()));

        trip.getTravelers().add(targetUser);
        tripRepository.save(trip);
    }

    @Override
    @Transactional
    public void unshareTrip(Long id, ShareTripRequest request, String ownerUsername) {
        Trip trip = tripRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found with ID: " + id));

        if (!trip.getOwner().getUsername().equals(ownerUsername)) {
            throw new BadRequestException("Only the trip owner can unshare the trip");
        }

        User targetUser = userRepository.findByUsername(request.getUsernameOrEmail())
                .or(() -> userRepository.findByEmail(request.getUsernameOrEmail()))
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username/email: " + request.getUsernameOrEmail()));

        if (targetUser.getUsername().equals(ownerUsername)) {
            throw new BadRequestException("Cannot remove the owner from the trip");
        }

        trip.getTravelers().remove(targetUser);
        tripRepository.save(trip);
    }

    @Override
    @Transactional(readOnly = true)
    public TripTimelineResponse getTripTimeline(Long id, String username) {
        Trip trip = tripRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found with ID: " + id));

        boolean isTraveler = trip.getTravelers().stream()
                .anyMatch(u -> u.getUsername().equals(username));

        if (!trip.getOwner().getUsername().equals(username) && !isTraveler) {
            throw new BadRequestException("You do not have permission to view this trip timeline");
        }

        // Fetch all activities for this trip sorted chronologically by date and start time
        List<Activity> activities = activityRepository.findByTripIdOrderByActivityDateAscStartTimeAsc(trip.getId());
        List<ActivityResponse> activityResponses = activityMapper.toResponseList(activities);

        java.util.List<TimelineDayResponse> days = new java.util.ArrayList<>();
        java.time.LocalDate start = trip.getStartDate();
        java.time.LocalDate end = trip.getEndDate();
        int dayNumber = 1;

        for (java.time.LocalDate date = start; !date.isAfter(end); date = date.plusDays(1)) {
            final java.time.LocalDate currentDate = date;
            List<ActivityResponse> dayActivities = activityResponses.stream()
                    .filter(a -> a.getActivityDate().equals(currentDate))
                    .collect(java.util.stream.Collectors.toList());

            days.add(TimelineDayResponse.builder()
                    .dayNumber(dayNumber++)
                    .date(date)
                    .activities(dayActivities)
                    .build());
        }

        return TripTimelineResponse.builder()
                .tripId(trip.getId())
                .title(trip.getTitle())
                .startDate(start)
                .endDate(end)
                .days(days)
                .build();
    }

    @Override
    @Transactional
    public com.tripnest.trip.dto.TripDocumentDto addDocument(Long tripId, com.tripnest.trip.dto.AddDocumentRequest request, String username) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found with ID: " + tripId));

        if (!trip.getOwner().getUsername().equals(username)) {
            boolean isTraveler = trip.getTravelers().stream()
                    .anyMatch(u -> u.getUsername().equals(username));
            if (!isTraveler) {
                throw new BadRequestException("You do not have permission to add documents to this trip");
            }
        }

        com.tripnest.trip.entity.TripDocument document = com.tripnest.trip.entity.TripDocument.builder()
                .name(request.getName())
                .fileUrl(request.getFileUrl())
                .fileType(request.getFileType())
                .fileSize(request.getFileSize())
                .trip(trip)
                .build();

        com.tripnest.trip.entity.TripDocument saved = tripDocumentRepository.save(document);

        return com.tripnest.trip.dto.TripDocumentDto.builder()
                .id(saved.getId())
                .name(saved.getName())
                .fileUrl(saved.getFileUrl())
                .fileType(saved.getFileType())
                .fileSize(saved.getFileSize())
                .uploadedAt(saved.getUploadedAt())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<com.tripnest.trip.dto.TripDocumentDto> getTripDocuments(Long tripId, String username) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found with ID: " + tripId));

        boolean isTraveler = trip.getTravelers().stream()
                .anyMatch(u -> u.getUsername().equals(username));
        if (!trip.getOwner().getUsername().equals(username) && !isTraveler) {
            throw new BadRequestException("You do not have permission to view this trip's documents");
        }

        return tripDocumentRepository.findByTripId(tripId).stream()
                .map(doc -> com.tripnest.trip.dto.TripDocumentDto.builder()
                        .id(doc.getId())
                        .name(doc.getName())
                        .fileUrl(doc.getFileUrl())
                        .fileType(doc.getFileType())
                        .fileSize(doc.getFileSize())
                        .uploadedAt(doc.getUploadedAt())
                        .build())
                .collect(java.util.stream.Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteDocument(Long tripId, Long documentId, String username) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found with ID: " + tripId));

        if (!trip.getOwner().getUsername().equals(username)) {
            throw new BadRequestException("Only the trip owner can delete documents");
        }

        com.tripnest.trip.entity.TripDocument document = tripDocumentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found with ID: " + documentId));

        if (!document.getTrip().getId().equals(tripId)) {
            throw new BadRequestException("Document does not belong to the specified trip");
        }

        tripDocumentRepository.delete(document);
    }
}
