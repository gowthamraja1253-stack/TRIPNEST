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
import com.tripnest.notification.service.NotificationService;
import com.tripnest.user.entity.User;
import org.springframework.stereotype.Service;
import com.tripnest.exception.BadRequestException;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;
import java.util.Set;
import java.util.HashSet;

@Service
public class ExpenseServiceImpl implements ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final TripRepository tripRepository;
    private final ExpenseMapper expenseMapper;
    private final NotificationService notificationService;

    public ExpenseServiceImpl(ExpenseRepository expenseRepository, 
                              TripRepository tripRepository, 
                              ExpenseMapper expenseMapper,
                              NotificationService notificationService) {
        this.expenseRepository = expenseRepository;
        this.tripRepository = tripRepository;
        this.expenseMapper = expenseMapper;
        this.notificationService = notificationService;
    }

    private void sendTripNotification(Trip trip, String actorUsername, String title, String message, String link) {
        Set<User> recipients = new HashSet<>(trip.getTravelers());
        recipients.add(trip.getOwner());
        for (User u : recipients) {
            if (!u.getUsername().equals(actorUsername)) {
                try {
                    notificationService.createNotification(
                        u.getUsername(),
                        title,
                        message,
                        com.tripnest.notification.entity.NotificationType.GENERAL,
                        link
                    );
                } catch (Exception e) {
                    // Ignore
                }
            }
        }
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

        String expenseTitle = (request.getTitle() != null && !request.getTitle().isBlank())
                ? request.getTitle()
                : (request.getDescription() != null ? request.getDescription() : "Expense");

        Expense expense = Expense.builder()
                .trip(trip)
                .title(expenseTitle)
                .amount(request.getAmount())
                .description(request.getDescription())
                .category(request.getCategory())
                .date(request.getExpenseDate())
                .build();

        Expense savedExpense = expenseRepository.save(expense);
        sendTripNotification(
            trip,
            username,
            "New Expense Added",
            username + " added expense '" + savedExpense.getTitle() + "' of ₹" + savedExpense.getAmount() + " to trip '" + trip.getTitle() + "'",
            "/dashboard/budget"
        );
        return expenseMapper.toResponse(savedExpense);
    }

    @Override
    @Transactional
    public ExpenseResponse updateExpense(Long tripId, Long expenseId, UpdateExpenseRequest request, String username) {
        Trip trip = getTripAndVerifyAccess(tripId, username);

        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found"));

        if (!expense.getTrip().getId().equals(tripId)) {
            throw new BadRequestException("Expense does not belong to the specified trip");
        }

        if (request.getTitle() != null) {
            expense.setTitle(request.getTitle());
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
            expense.setDate(request.getExpenseDate());
        }

        Expense updatedExpense = expenseRepository.save(expense);
        sendTripNotification(
            trip,
            username,
            "Expense Updated",
            username + " updated expense '" + updatedExpense.getTitle() + "' to ₹" + updatedExpense.getAmount() + " in trip '" + trip.getTitle() + "'",
            "/dashboard/budget"
        );
        return expenseMapper.toResponse(updatedExpense);
    }

    @Override
    @Transactional
    public void deleteExpense(Long tripId, Long expenseId, String username) {
        Trip trip = getTripAndVerifyAccess(tripId, username);

        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found"));

        if (!expense.getTrip().getId().equals(tripId)) {
            throw new BadRequestException("Expense does not belong to the specified trip");
        }

        expenseRepository.delete(expense);
        sendTripNotification(
            trip,
            username,
            "Expense Deleted",
            username + " deleted expense '" + expense.getTitle() + "' of ₹" + expense.getAmount() + " from trip '" + trip.getTitle() + "'",
            "/dashboard/budget"
        );
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
