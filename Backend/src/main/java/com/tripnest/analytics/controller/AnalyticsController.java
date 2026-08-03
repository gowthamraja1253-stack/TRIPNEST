package com.tripnest.analytics.controller;

import com.tripnest.analytics.dto.DashboardStatsResponse;
import com.tripnest.analytics.service.AnalyticsService;
import com.tripnest.common.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/dashboard/stats")
    public ResponseEntity<ApiResponse<DashboardStatsResponse>> getDashboardStats(Authentication authentication) {
        String username = (authentication != null) ? authentication.getName() : "testuser";
        DashboardStatsResponse response = analyticsService.getDashboardStats(username);
        return ResponseEntity.ok(ApiResponse.success(response, "Dashboard stats retrieved successfully"));
    }

    @GetMapping("/trips/{tripId}")
    public ResponseEntity<ApiResponse<com.tripnest.analytics.dto.AnalyticsReportDto>> getTripAnalytics(
            @org.springframework.web.bind.annotation.PathVariable("tripId") Long tripId,
            Authentication authentication) {
        String username = (authentication != null) ? authentication.getName() : "testuser";
        com.tripnest.analytics.dto.AnalyticsReportDto response = analyticsService.getTripAnalytics(tripId, username);
        return ResponseEntity.ok(ApiResponse.success(response, "Trip analytics retrieved successfully"));
    }

    @GetMapping("/reports")
    public ResponseEntity<ApiResponse<com.tripnest.analytics.dto.AnalyticsReportDto>> getUserGlobalAnalytics(Authentication authentication) {
        String username = (authentication != null) ? authentication.getName() : "testuser";
        com.tripnest.analytics.dto.AnalyticsReportDto response = analyticsService.getUserGlobalAnalytics(username);
        return ResponseEntity.ok(ApiResponse.success(response, "Global analytics retrieved successfully"));
    }

    @GetMapping("/admin")
    public ResponseEntity<ApiResponse<com.tripnest.analytics.dto.AdminAnalyticsDto>> getAdminAnalytics() {
        com.tripnest.analytics.dto.AdminAnalyticsDto response = analyticsService.getAdminAnalytics();
        return ResponseEntity.ok(ApiResponse.success(response, "Admin analytics retrieved successfully"));
    }
}
