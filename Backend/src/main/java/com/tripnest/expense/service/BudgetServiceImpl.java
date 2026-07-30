package com.tripnest.expense.service;

import com.tripnest.exception.BadRequestException;
import com.tripnest.exception.ResourceNotFoundException;
import com.tripnest.expense.dto.BudgetRequest;
import com.tripnest.expense.dto.BudgetResponse;
import com.tripnest.expense.dto.BudgetSummaryResponse;
import com.tripnest.expense.entity.Budget;
import com.tripnest.expense.entity.BudgetStatus;
import com.tripnest.expense.entity.Expense;
import com.tripnest.expense.entity.ExpenseCategory;
import com.tripnest.expense.repository.BudgetRepository;
import com.tripnest.expense.repository.ExpenseRepository;
import com.tripnest.trip.entity.Trip;
import com.tripnest.trip.repository.TripRepository;
import com.tripnest.user.entity.User;
import com.tripnest.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class BudgetServiceImpl implements BudgetService {

    private final BudgetRepository budgetRepository;
    private final TripRepository tripRepository;
    private final ExpenseRepository expenseRepository;
    private final UserRepository userRepository;

    public BudgetServiceImpl(BudgetRepository budgetRepository, TripRepository tripRepository,
                             ExpenseRepository expenseRepository, UserRepository userRepository) {
        this.budgetRepository = budgetRepository;
        this.tripRepository = tripRepository;
        this.expenseRepository = expenseRepository;
        this.userRepository = userRepository;
    }

    private Trip getTripAndVerifyAccess(Long tripId, String username) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found"));

        boolean isOwner = trip.getOwner().getUsername().equals(username);
        boolean isTraveler = trip.getTravelers().stream().anyMatch(u -> u.getUsername().equals(username));

        if (!isOwner && !isTraveler) {
            throw new BadRequestException("You do not have access to this trip");
        }
        return trip;
    }

    @Override
    @Transactional
    public BudgetResponse createBudget(BudgetRequest request, String username) {
        Trip trip = getTripAndVerifyAccess(request.getTripId(), username);
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Check if a budget already exists for this trip
        if (budgetRepository.findByTripId(request.getTripId()).isPresent()) {
            throw new BadRequestException("A budget already exists for this trip. Update the existing budget instead.");
        }

        Budget budget = Budget.builder()
                .totalBudget(request.getTotalBudget())
                .remainingAmount(request.getTotalBudget())
                .spentAmount(0.0)
                .startDate(request.getStartDate() != null ? request.getStartDate() : trip.getStartDate())
                .endDate(request.getEndDate() != null ? request.getEndDate() : trip.getEndDate())
                .status(BudgetStatus.ACTIVE)
                .trip(trip)
                .user(user)
                .build();

        Budget saved = budgetRepository.save(budget);
        return toResponse(saved);
    }

    @Override
    @Transactional
    public BudgetResponse updateBudget(Long budgetId, BudgetRequest request, String username) {
        Budget budget = budgetRepository.findById(budgetId)
                .orElseThrow(() -> new ResourceNotFoundException("Budget not found"));

        getTripAndVerifyAccess(budget.getTrip().getId(), username);

        budget.setTotalBudget(request.getTotalBudget());
        budget.setRemainingAmount(request.getTotalBudget() - budget.getSpentAmount());
        if (request.getStartDate() != null) budget.setStartDate(request.getStartDate());
        if (request.getEndDate() != null) budget.setEndDate(request.getEndDate());

        Budget saved = budgetRepository.save(budget);
        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public BudgetResponse getBudgetByTrip(Long tripId, String username) {
        getTripAndVerifyAccess(tripId, username);

        Budget budget = budgetRepository.findByTripId(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("No budget found for this trip"));

        // Recalculate spent from actual expenses
        List<Expense> expenses = expenseRepository.findByTripId(tripId);
        double totalSpent = expenses.stream().mapToDouble(Expense::getAmount).sum();
        budget.setSpentAmount(totalSpent);
        budget.setRemainingAmount(budget.getTotalBudget() - totalSpent);

        return toResponse(budget);
    }

    @Override
    @Transactional(readOnly = true)
    public BudgetSummaryResponse getBudgetSummary(Long tripId, String username) {
        getTripAndVerifyAccess(tripId, username);

        Budget budget = budgetRepository.findByTripId(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("No budget found for this trip"));

        List<Expense> expenses = expenseRepository.findByTripId(tripId);
        double totalSpent = expenses.stream().mapToDouble(Expense::getAmount).sum();

        // Calculate spending by category
        Map<String, Double> spendingByCategory = new HashMap<>();
        for (ExpenseCategory cat : ExpenseCategory.values()) {
            double catTotal = expenses.stream()
                    .filter(e -> e.getCategory() == cat)
                    .mapToDouble(Expense::getAmount)
                    .sum();
            if (catTotal > 0) {
                spendingByCategory.put(cat.name(), catTotal);
            }
        }

        double percentageUsed = budget.getTotalBudget() > 0 ? (totalSpent / budget.getTotalBudget()) * 100 : 0;

        return BudgetSummaryResponse.builder()
                .budgetId(budget.getId())
                .tripId(tripId)
                .totalBudget(budget.getTotalBudget())
                .totalSpent(totalSpent)
                .remaining(budget.getTotalBudget() - totalSpent)
                .percentageUsed(Math.round(percentageUsed * 100.0) / 100.0)
                .status(budget.getStatus())
                .spendingByCategory(spendingByCategory)
                .build();
    }

    @Override
    @Transactional
    public void deleteBudget(Long budgetId, String username) {
        Budget budget = budgetRepository.findById(budgetId)
                .orElseThrow(() -> new ResourceNotFoundException("Budget not found"));

        getTripAndVerifyAccess(budget.getTrip().getId(), username);
        budgetRepository.delete(budget);
    }

    private BudgetResponse toResponse(Budget budget) {
        return BudgetResponse.builder()
                .id(budget.getId())
                .tripId(budget.getTrip() != null ? budget.getTrip().getId() : null)
                .userId(budget.getUser() != null ? budget.getUser().getId() : null)
                .totalBudget(budget.getTotalBudget())
                .spentAmount(budget.getSpentAmount())
                .remainingAmount(budget.getRemainingAmount())
                .startDate(budget.getStartDate())
                .endDate(budget.getEndDate())
                .status(budget.getStatus())
                .createdAt(budget.getCreatedAt())
                .updatedAt(budget.getUpdatedAt())
                .build();
    }
}
