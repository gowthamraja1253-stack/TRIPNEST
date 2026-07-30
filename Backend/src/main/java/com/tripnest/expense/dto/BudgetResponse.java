package com.tripnest.expense.dto;

import com.tripnest.expense.entity.BudgetStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BudgetResponse {
    private Long id;
    private Long tripId;
    private Long userId;
    private Double totalBudget;
    private Double spentAmount;
    private Double remainingAmount;
    private LocalDate startDate;
    private LocalDate endDate;
    private BudgetStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
