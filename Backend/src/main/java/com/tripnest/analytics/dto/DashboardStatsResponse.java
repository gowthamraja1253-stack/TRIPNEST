package com.tripnest.analytics.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DashboardStatsResponse {
    private long upcomingTrips;
    private long countriesVisited;
    private double totalBudget;
    private double totalExpenses;
    private long travelDays;
    private long achievements;
}
