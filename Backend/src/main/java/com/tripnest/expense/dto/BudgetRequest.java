package com.tripnest.expense.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BudgetRequest {

    @NotNull(message = "Trip ID is required")
    private Long tripId;

    @NotNull(message = "Total budget amount is required")
    @Min(value = 1, message = "Budget must be greater than zero")
    private Double totalBudget;

    private LocalDate startDate;

    private LocalDate endDate;
}
