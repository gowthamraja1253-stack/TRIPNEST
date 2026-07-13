package com.tripnest.expense.mapper;

import com.tripnest.expense.dto.ExpenseResponse;
import com.tripnest.expense.entity.Expense;
import org.springframework.stereotype.Component;

@Component
public class ExpenseMapper {

    public ExpenseResponse toResponse(Expense expense) {
        if (expense == null) {
            return null;
        }
        return ExpenseResponse.builder()
                .id(expense.getId())
                .tripId(expense.getTrip().getId())
                .amount(expense.getAmount())
                .description(expense.getDescription())
                .category(expense.getCategory())
                .expenseDate(expense.getExpenseDate())
                .build();
    }
}
