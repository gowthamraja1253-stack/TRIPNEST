package com.tripnest.expense.controller;

import com.tripnest.expense.dto.BudgetRequest;
import com.tripnest.expense.dto.BudgetResponse;
import com.tripnest.expense.dto.BudgetSummaryResponse;
import com.tripnest.expense.service.BudgetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/budgets")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class BudgetController {

    private final BudgetService budgetService;

    @PostMapping
    public ResponseEntity<BudgetResponse> createBudget(
            @Valid @RequestBody BudgetRequest request,
            Authentication authentication) {
        return new ResponseEntity<>(
                budgetService.createBudget(request, authentication.getName()),
                HttpStatus.CREATED
        );
    }

    @PutMapping("/{budgetId}")
    public ResponseEntity<BudgetResponse> updateBudget(
            @PathVariable("budgetId") Long budgetId,
            @Valid @RequestBody BudgetRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(
                budgetService.updateBudget(budgetId, request, authentication.getName())
        );
    }

    @GetMapping("/trip/{tripId}")
    public ResponseEntity<BudgetResponse> getBudgetByTrip(
            @PathVariable("tripId") Long tripId,
            Authentication authentication) {
        return ResponseEntity.ok(
                budgetService.getBudgetByTrip(tripId, authentication.getName())
        );
    }

    @GetMapping("/trip/{tripId}/summary")
    public ResponseEntity<BudgetSummaryResponse> getBudgetSummary(
            @PathVariable("tripId") Long tripId,
            Authentication authentication) {
        return ResponseEntity.ok(
                budgetService.getBudgetSummary(tripId, authentication.getName())
        );
    }

    @DeleteMapping("/{budgetId}")
    public ResponseEntity<Void> deleteBudget(
            @PathVariable("budgetId") Long budgetId,
            Authentication authentication) {
        budgetService.deleteBudget(budgetId, authentication.getName());
        return ResponseEntity.noContent().build();
    }
}
