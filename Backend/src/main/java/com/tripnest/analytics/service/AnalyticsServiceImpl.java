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
    @Override
    public com.tripnest.analytics.dto.AnalyticsReportDto getTripAnalytics(Long tripId, String username) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new com.tripnest.exception.ResourceNotFoundException("Trip not found"));

        // Verify access - assuming either owner or traveler can view
        boolean isTraveler = trip.getTravelers().stream().anyMatch(u -> u.getUsername().equals(username));
        if (!trip.getOwner().getUsername().equals(username) && !isTraveler) {
            throw new com.tripnest.exception.UnauthorizedAccessException("Not authorized to view this trip's analytics");
        }

        List<com.tripnest.expense.entity.Expense> expenses = expenseRepository.findByTripId(tripId);
        
        return buildAnalyticsReport(expenses, trip.getBudget());
    }

    @Override
    public com.tripnest.analytics.dto.AnalyticsReportDto getUserGlobalAnalytics(String username) {
        List<Trip> trips = tripRepository.findAllByUser(username);
        
        List<com.tripnest.expense.entity.Expense> allExpenses = new java.util.ArrayList<>();
        double totalBudget = 0.0;
        
        for (Trip trip : trips) {
            allExpenses.addAll(expenseRepository.findByTripId(trip.getId()));
            if (trip.getBudget() != null) {
                totalBudget += trip.getBudget();
            }
        }
        
        return buildAnalyticsReport(allExpenses, totalBudget);
    }
    
    private com.tripnest.analytics.dto.AnalyticsReportDto buildAnalyticsReport(List<com.tripnest.expense.entity.Expense> expenses, Double totalBudget) {
        double totalSpent = expenses.stream()
                .mapToDouble(e -> e.getAmount() != null ? e.getAmount() : 0.0)
                .sum();
                
        java.util.Map<String, Double> byCategory = expenses.stream()
                .collect(Collectors.groupingBy(
                        e -> e.getCategory().name(),
                        Collectors.summingDouble(e -> e.getAmount() != null ? e.getAmount() : 0.0)
                ));
                
        java.util.Map<String, Double> byMonth = expenses.stream()
                .collect(Collectors.groupingBy(
                        e -> e.getDate().getMonth().name() + " " + e.getDate().getYear(),
                        Collectors.summingDouble(e -> e.getAmount() != null ? e.getAmount() : 0.0)
                ));
                
        Double budgetRemaining = totalBudget != null ? totalBudget - totalSpent : null;
        Double budgetUsedPercentage = (totalBudget != null && totalBudget > 0) ? (totalSpent / totalBudget) * 100 : 0.0;
        
        return com.tripnest.analytics.dto.AnalyticsReportDto.builder()
                .totalSpent(totalSpent)
                .totalBudget(totalBudget)
                .budgetRemaining(budgetRemaining)
                .budgetUsedPercentage(budgetUsedPercentage)
                .expensesByCategory(byCategory)
                .expensesByMonth(byMonth)
                .build();
    }
}
