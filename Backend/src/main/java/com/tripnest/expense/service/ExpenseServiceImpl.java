package com.tripnest.expense.service;

import com.tripnest.exception.ResourceNotFoundException;
import com.tripnest.exception.UnauthorizedException;
import com.tripnest.expense.dto.CreateExpenseRequest;
import com.tripnest.expense.dto.ExpenseResponse;
import com.tripnest.expense.dto.UpdateExpenseRequest;
import com.tripnest.expense.entity.Expense;
import com.tripnest.expense.mapper.ExpenseMapper;
import com.tripnest.expense.repository.ExpenseRepository;
import com.tripnest.trip.entity.Trip;
import com.tripnest.trip.repository.TripRepository;
import org.springframework.stereotype.Service;
import com.tripnest.exception.BadRequestException;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ExpenseServiceImpl implements ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final TripRepository tripRepository;
    private final ExpenseMapper expenseMapper;

    public ExpenseServiceImpl(ExpenseRepository expenseRepository, TripRepository tripRepository, ExpenseMapper expenseMapper) {
        this.expenseRepository = expenseRepository;
        this.tripRepository = tripRepository;
        this.expenseMapper = expenseMapper;
    }

    private Trip getTripAndVerifyAccess(Long tripId, String username) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found"));

        boolean isOwner = trip.getOwner().getUsername().equals(username);
        boolean isTraveler = trip.getTravelers().stream().anyMatch(u -> u.getUsername().equals(username));

        if (!isOwner && !isTraveler) {
            throw new UnauthorizedException("You do not have access to this trip");
        }
        return trip;
    }

    @Override
    @Transactional
    public ExpenseResponse addExpense(Long tripId, CreateExpenseRequest request, String username) {
        Trip trip = getTripAndVerifyAccess(tripId, username);

        Expense expense = Expense.builder()
                .trip(trip)
                .amount(request.getAmount())
                .description(request.getDescription())
                .category(request.getCategory())
                .expenseDate(request.getExpenseDate())
                .build();

        Expense savedExpense = expenseRepository.save(expense);
        return expenseMapper.toResponse(savedExpense);
    }

    @Override
    @Transactional
    public ExpenseResponse updateExpense(Long tripId, Long expenseId, UpdateExpenseRequest request, String username) {
        getTripAndVerifyAccess(tripId, username);

        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found"));

        if (!expense.getTrip().getId().equals(tripId)) {
            throw new BadRequestException("Expense does not belong to the specified trip");
        }

        if (request.getAmount() != null) {
            expense.setAmount(request.getAmount());
        }
        if (request.getDescription() != null) {
            expense.setDescription(request.getDescription());
        }
        if (request.getCategory() != null) {
            expense.setCategory(request.getCategory());
        }
        if (request.getExpenseDate() != null) {
            expense.setExpenseDate(request.getExpenseDate());
        }

        Expense updatedExpense = expenseRepository.save(expense);
        return expenseMapper.toResponse(updatedExpense);
    }

    @Override
    @Transactional
    public void deleteExpense(Long tripId, Long expenseId, String username) {
        getTripAndVerifyAccess(tripId, username);

        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found"));

        if (!expense.getTrip().getId().equals(tripId)) {
            throw new BadRequestException("Expense does not belong to the specified trip");
        }

        expenseRepository.delete(expense);
    }

    @Override
    public List<ExpenseResponse> getExpensesByTrip(Long tripId, String username) {
        getTripAndVerifyAccess(tripId, username);

        List<Expense> expenses = expenseRepository.findByTripId(tripId);
        return expenses.stream()
                .map(expenseMapper::toResponse)
                .collect(Collectors.toList());
    }
}
