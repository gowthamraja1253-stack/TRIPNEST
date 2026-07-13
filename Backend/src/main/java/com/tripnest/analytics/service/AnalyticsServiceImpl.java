package com.tripnest.analytics.service;

import com.tripnest.analytics.dto.DashboardStatsResponse;
import com.tripnest.expense.repository.ExpenseRepository;
import com.tripnest.trip.entity.Trip;
import com.tripnest.trip.entity.TripStatus;
import com.tripnest.trip.repository.TripRepository;
import org.springframework.stereotype.Service;

import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AnalyticsServiceImpl implements AnalyticsService {

    private final TripRepository tripRepository;
    private final ExpenseRepository expenseRepository;

    public AnalyticsServiceImpl(TripRepository tripRepository, ExpenseRepository expenseRepository) {
        this.tripRepository = tripRepository;
        this.expenseRepository = expenseRepository;
    }

    @Override
    public DashboardStatsResponse getDashboardStats(String username) {
        List<Trip> trips = tripRepository.findAllByUser(username);
        
        long upcomingTrips = trips.stream()
                .filter(t -> t.getStatus() == TripStatus.PLANNED || t.getStatus() == TripStatus.ACTIVE)
                .count();

        Set<String> uniqueCountries = trips.stream()
                .filter(t -> t.getStatus() == TripStatus.COMPLETED)
                .map(t -> t.getDestination().getCountry())
                .collect(Collectors.toSet());
                
        double totalBudget = trips.stream()
                .mapToDouble(t -> t.getBudget() != null ? t.getBudget() : 0.0)
                .sum();
                
        double totalExpenses = 0.0;
        for (Trip trip : trips) {
            totalExpenses += expenseRepository.findByTripId(trip.getId()).stream()
                    .mapToDouble(e -> e.getAmount() != null ? e.getAmount() : 0.0)
                    .sum();
        }

        long travelDays = trips.stream()
                .mapToLong(t -> ChronoUnit.DAYS.between(t.getStartDate(), t.getEndDate()) + 1)
                .sum();

        long achievements = trips.isEmpty() ? 0 : trips.size() + 2;

        return DashboardStatsResponse.builder()
                .upcomingTrips(upcomingTrips)
                .countriesVisited(uniqueCountries.size())
                .totalBudget(totalBudget)
                .totalExpenses(totalExpenses)
                .travelDays(travelDays)
                .achievements(achievements)
                .build();
    }
}
