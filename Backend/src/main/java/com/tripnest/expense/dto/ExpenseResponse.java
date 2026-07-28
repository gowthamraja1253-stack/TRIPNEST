package com.tripnest.expense.dto;

import com.tripnest.expense.entity.ExpenseCategory;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class ExpenseResponse {
    private Long id;
    private Long tripId;
    private Double amount;
    private String description;
    private ExpenseCategory category;
    private LocalDate expenseDate;
}
