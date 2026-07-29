package com.tripnest.expense.repository;

import com.tripnest.expense.entity.Budget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, Long> {

    Optional<Budget> findByTripId(Long tripId);

    Optional<Budget> findByUserId(Long userId);

}