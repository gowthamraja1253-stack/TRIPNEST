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
        String username = authentication.getName();
        DashboardStatsResponse response = analyticsService.getDashboardStats(username);
        return ResponseEntity.ok(ApiResponse.success(response, "Dashboard stats retrieved successfully"));
    }
}
