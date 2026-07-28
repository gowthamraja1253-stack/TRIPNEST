package com.tripnest.expense.repository;

import com.tripnest.expense.entity.Expense;
import com.tripnest.expense.entity.ExpenseCategory;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    List<Expense> findByUserId(Long userId);

    List<Expense> findByTripId(Long tripId);

    List<Expense> findByCategory(ExpenseCategory category);

}