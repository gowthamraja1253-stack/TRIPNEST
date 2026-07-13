package com.tripnest.expense.controller;

import com.tripnest.common.dto.ApiResponse;
import com.tripnest.expense.dto.CreateExpenseRequest;
import com.tripnest.expense.dto.ExpenseResponse;
import com.tripnest.expense.dto.UpdateExpenseRequest;
import com.tripnest.expense.service.ExpenseService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/trips/{tripId}/expenses")
public class ExpenseController {

    private final ExpenseService expenseService;

    public ExpenseController(ExpenseService expenseService) {
        this.expenseService = expenseService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ExpenseResponse>> addExpense(
            Authentication authentication,
            @PathVariable Long tripId,
            @Valid @RequestBody CreateExpenseRequest request) {
        String username = authentication.getName();
        ExpenseResponse response = expenseService.addExpense(tripId, request, username);
        return ResponseEntity.ok(ApiResponse.success(response, "Expense added successfully"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ExpenseResponse>>> getExpenses(
            Authentication authentication,
            @PathVariable Long tripId) {
        String username = authentication.getName();
        List<ExpenseResponse> response = expenseService.getExpensesByTrip(tripId, username);
        return ResponseEntity.ok(ApiResponse.success(response, "Expenses retrieved successfully"));
    }

    @PutMapping("/{expenseId}")
    public ResponseEntity<ApiResponse<ExpenseResponse>> updateExpense(
            Authentication authentication,
            @PathVariable Long tripId,
            @PathVariable Long expenseId,
            @Valid @RequestBody UpdateExpenseRequest request) {
        String username = authentication.getName();
        ExpenseResponse response = expenseService.updateExpense(tripId, expenseId, request, username);
        return ResponseEntity.ok(ApiResponse.success(response, "Expense updated successfully"));
    }

    @DeleteMapping("/{expenseId}")
    public ResponseEntity<ApiResponse<Void>> deleteExpense(
            Authentication authentication,
            @PathVariable Long tripId,
            @PathVariable Long expenseId) {
        String username = authentication.getName();
        expenseService.deleteExpense(tripId, expenseId, username);
        return ResponseEntity.ok(ApiResponse.success(null, "Expense deleted successfully"));
    }
}
