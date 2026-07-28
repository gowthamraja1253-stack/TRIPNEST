package com.tripnest.expense.service;

import com.tripnest.expense.dto.CreateExpenseRequest;
import com.tripnest.expense.dto.ExpenseResponse;
import com.tripnest.expense.dto.UpdateExpenseRequest;

import java.util.List;

public interface ExpenseService {

    ExpenseResponse addExpense(Long tripId, CreateExpenseRequest request, String username);

    ExpenseResponse updateExpense(Long tripId, Long expenseId, UpdateExpenseRequest request, String username);

    void deleteExpense(Long tripId, Long expenseId, String username);

    List<ExpenseResponse> getExpensesByTrip(Long tripId, String username);
}