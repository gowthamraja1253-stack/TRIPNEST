package com.tripnest.expense.service;

import com.tripnest.expense.dto.BudgetRequest;
import com.tripnest.expense.dto.BudgetResponse;
import com.tripnest.expense.dto.BudgetSummaryResponse;

public interface BudgetService {

    BudgetResponse createBudget(BudgetRequest request, String username);

    BudgetResponse updateBudget(Long budgetId, BudgetRequest request, String username);

    BudgetResponse getBudgetByTrip(Long tripId, String username);

    BudgetSummaryResponse getBudgetSummary(Long tripId, String username);

    void deleteBudget(Long budgetId, String username);
}
