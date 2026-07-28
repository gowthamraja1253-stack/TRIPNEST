package com.tripnest.analytics.service;

import com.tripnest.analytics.dto.DashboardStatsResponse;

public interface AnalyticsService {
    DashboardStatsResponse getDashboardStats(String username);
    com.tripnest.analytics.dto.AnalyticsReportDto getTripAnalytics(Long tripId, String username);
    com.tripnest.analytics.dto.AnalyticsReportDto getUserGlobalAnalytics(String username);
}
