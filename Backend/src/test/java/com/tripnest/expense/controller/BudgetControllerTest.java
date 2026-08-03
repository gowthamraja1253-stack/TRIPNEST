package com.tripnest.expense.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tripnest.expense.dto.BudgetRequest;
import com.tripnest.expense.dto.BudgetResponse;
import com.tripnest.expense.dto.BudgetSummaryResponse;
import com.tripnest.expense.entity.BudgetStatus;
import com.tripnest.expense.service.BudgetService;
import com.tripnest.security.config.PasswordConfig;
import com.tripnest.security.config.SecurityConfig;
import com.tripnest.security.jwt.JwtTokenProvider;
import com.tripnest.security.user.CustomUserDetailsService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = BudgetController.class)
@Import({SecurityConfig.class, PasswordConfig.class})
public class BudgetControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private BudgetService budgetService;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private CustomUserDetailsService customUserDetailsService;

    @Test
    @WithMockUser(username = "testuser")
    public void testCreateBudgetSuccess() throws Exception {
        BudgetRequest request = BudgetRequest.builder()
                .tripId(1L)
                .totalBudget(5000.0)
                .build();

        BudgetResponse response = BudgetResponse.builder()
                .id(10L)
                .tripId(1L)
                .totalBudget(5000.0)
                .spentAmount(0.0)
                .remainingAmount(5000.0)
                .status(BudgetStatus.ACTIVE)
                .build();

        when(budgetService.createBudget(any(BudgetRequest.class), eq("testuser"))).thenReturn(response);

        mockMvc.perform(post("/api/v1/budgets")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(10))
                .andExpect(jsonPath("$.totalBudget").value(5000.0))
                .andExpect(jsonPath("$.status").value("ACTIVE"));
    }

    @Test
    @WithMockUser(username = "testuser")
    public void testGetBudgetByTripSuccess() throws Exception {
        BudgetResponse response = BudgetResponse.builder()
                .id(10L)
                .tripId(1L)
                .totalBudget(5000.0)
                .spentAmount(1200.0)
                .remainingAmount(3800.0)
                .status(BudgetStatus.ACTIVE)
                .build();

        when(budgetService.getBudgetByTrip(1L, "testuser")).thenReturn(response);

        mockMvc.perform(get("/api/v1/budgets/trip/1")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(10))
                .andExpect(jsonPath("$.spentAmount").value(1200.0))
                .andExpect(jsonPath("$.remainingAmount").value(3800.0));
    }

    @Test
    @WithMockUser(username = "testuser")
    public void testGetBudgetSummarySuccess() throws Exception {
        BudgetSummaryResponse summary = BudgetSummaryResponse.builder()
                .budgetId(10L)
                .tripId(1L)
                .totalBudget(5000.0)
                .totalSpent(1200.0)
                .remaining(3800.0)
                .percentageUsed(24.0)
                .status(BudgetStatus.ACTIVE)
                .spendingByCategory(Map.of("FOOD", 500.0, "TRANSPORTATION", 700.0))
                .build();

        when(budgetService.getBudgetSummary(1L, "testuser")).thenReturn(summary);

        mockMvc.perform(get("/api/v1/budgets/trip/1/summary")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalSpent").value(1200.0))
                .andExpect(jsonPath("$.percentageUsed").value(24.0))
                .andExpect(jsonPath("$.spendingByCategory.FOOD").value(500.0));
    }

    @Test
    @WithMockUser(username = "testuser")
    public void testDeleteBudgetSuccess() throws Exception {
        doNothing().when(budgetService).deleteBudget(10L, "testuser");

        mockMvc.perform(delete("/api/v1/budgets/10")
                        .with(csrf()))
                .andExpect(status().isNoContent());
    }
}
