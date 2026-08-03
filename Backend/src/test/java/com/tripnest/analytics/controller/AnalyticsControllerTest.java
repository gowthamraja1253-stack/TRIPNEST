package com.tripnest.analytics.controller;

import com.tripnest.analytics.dto.AdminAnalyticsDto;
import com.tripnest.analytics.dto.AnalyticsReportDto;
import com.tripnest.analytics.dto.DashboardStatsResponse;
import com.tripnest.analytics.service.AnalyticsService;
import com.tripnest.security.jwt.JwtAuthenticationFilter;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.HashMap;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = AnalyticsController.class)
@AutoConfigureMockMvc(addFilters = false)
class AnalyticsControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AnalyticsService analyticsService;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @BeforeEach
    void setUp() {
        DashboardStatsResponse stats = DashboardStatsResponse.builder()
                .upcomingTrips(2L)
                .countriesVisited(3)
                .totalBudget(50000.0)
                .totalExpenses(12000.0)
                .build();

        AnalyticsReportDto report = AnalyticsReportDto.builder()
                .totalSpent(12000.0)
                .totalBudget(50000.0)
                .budgetRemaining(38000.0)
                .budgetUsedPercentage(24.0)
                .expensesByCategory(new HashMap<>())
                .expensesByMonth(new HashMap<>())
                .build();

        AdminAnalyticsDto adminStats = AdminAnalyticsDto.builder()
                .totalUsers(10L)
                .totalTrips(15L)
                .totalDestinations(5L)
                .totalExpensesCount(45L)
                .totalPlatformExpensesAmount(150000.0)
                .tripsByStatus(new HashMap<>())
                .topDestinations(new HashMap<>())
                .build();

        when(analyticsService.getDashboardStats(anyString())).thenReturn(stats);
        when(analyticsService.getUserGlobalAnalytics(anyString())).thenReturn(report);
        when(analyticsService.getTripAnalytics(eq(1L), anyString())).thenReturn(report);
        when(analyticsService.getAdminAnalytics()).thenReturn(adminStats);
    }

    @Test
    void getDashboardStats_ShouldReturn200() throws Exception {
        mockMvc.perform(get("/api/v1/analytics/dashboard/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.upcomingTrips").value(2));
    }

    @Test
    void getUserGlobalAnalytics_ShouldReturn200() throws Exception {
        mockMvc.perform(get("/api/v1/analytics/reports"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.totalSpent").value(12000.0));
    }

    @Test
    void getAdminAnalytics_ShouldReturn200() throws Exception {
        mockMvc.perform(get("/api/v1/analytics/admin"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.totalUsers").value(10));
    }
}
