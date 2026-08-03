package com.tripnest.trip.service;

import com.tripnest.exception.ResourceNotFoundException;
import com.tripnest.trip.dto.DestinationResponse;
import com.tripnest.trip.dto.WeatherResponse;
import com.tripnest.trip.entity.Destination;
import com.tripnest.trip.mapper.DestinationMapper;
import com.tripnest.trip.repository.DestinationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
public class DestinationServiceImpl implements DestinationService {

    private final DestinationRepository destinationRepository;
    private final DestinationMapper destinationMapper;
    private final OpenWeatherService openWeatherService;

    public DestinationServiceImpl(DestinationRepository destinationRepository, DestinationMapper destinationMapper, OpenWeatherService openWeatherService) {
        this.destinationRepository = destinationRepository;
        this.destinationMapper = destinationMapper;
        this.openWeatherService = openWeatherService;
    }

    @Override
    @Transactional(readOnly = true)
    public List<DestinationResponse> getAllDestinations(String search, Boolean popular) {
        List<Destination> destinations;

        if (popular != null && popular) {
            destinations = destinationRepository.findByPopularTrue();
        } else if (StringUtils.hasText(search)) {
            destinations = destinationRepository.findByNameContainingIgnoreCaseOrCountryContainingIgnoreCase(search, search);
        } else {
            destinations = destinationRepository.findAll();
        }

        return destinationMapper.toResponseList(destinations);
    }

    @Override
    @Transactional(readOnly = true)
    public DestinationResponse getDestinationById(Long id) {
        Destination destination = destinationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Destination not found with ID: " + id));
        return destinationMapper.toResponse(destination);
    }

    @Override
    @Transactional(readOnly = true)
    public WeatherResponse getWeatherForDestination(Long id) {
        Destination destination = destinationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Destination not found with ID: " + id));

        return openWeatherService.getWeather(destination.getName());
    }

    @Override
    @Transactional
    public DestinationResponse createDestination(com.tripnest.trip.dto.CreateDestinationRequest request) {
        Destination destination = Destination.builder()
                .name(request.getName())
                .country(request.getCountry())
                .description(request.getDescription())
                .attractions(request.getAttractions())
                .popular(request.getPopular() != null ? request.getPopular() : false)
                .imageUrl(request.getImageUrl())
                .build();

        Destination saved = destinationRepository.save(destination);
        return destinationMapper.toResponse(saved);
    }
}
