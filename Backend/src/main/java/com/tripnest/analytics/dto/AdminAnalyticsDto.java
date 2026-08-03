package com.tripnest.analytics.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminAnalyticsDto {
    private long totalUsers;
    private long totalTrips;
    private long totalDestinations;
    private long totalExpensesCount;
    private double totalPlatformExpensesAmount;
    private Map<String, Long> tripsByStatus;
    private Map<String, Long> topDestinations;
}
