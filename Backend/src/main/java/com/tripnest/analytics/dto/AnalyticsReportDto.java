package com.tripnest.analytics.dto;

import lombok.Builder;
import lombok.Data;
import java.util.Map;

@Data
@Builder
public class AnalyticsReportDto {
    private Double totalSpent;
    private Double totalBudget;
    private Double budgetRemaining;
    private Double budgetUsedPercentage;
    
    private Map<String, Double> expensesByCategory;
    private Map<String, Double> expensesByMonth;
}
