package com.tripnest.expense.dto;

import com.tripnest.expense.entity.BudgetStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BudgetSummaryResponse {
    private Long budgetId;
    private Long tripId;
    private Double totalBudget;
    private Double totalSpent;
    private Double remaining;
    private Double percentageUsed;
    private BudgetStatus status;
    private Map<String, Double> spendingByCategory;
}
