package com.tripnest.analytics.service;

import com.tripnest.analytics.dto.DashboardStatsResponse;

public interface AnalyticsService {
    DashboardStatsResponse getDashboardStats(String username);
}
