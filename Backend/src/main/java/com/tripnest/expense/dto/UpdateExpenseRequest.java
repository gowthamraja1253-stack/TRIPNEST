package com.tripnest.expense.dto;

import com.tripnest.expense.entity.ExpenseCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.time.LocalDate;

@Data
public class UpdateExpenseRequest {

    private String title;

    @Positive(message = "Amount must be positive")
    private Double amount;

    private String description;

    private ExpenseCategory category;

    private LocalDate expenseDate;
}
