package com.nmdecor.staff_tracker.repository;

import com.nmdecor.staff_tracker.model.Employee;
import com.nmdecor.staff_tracker.model.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    List<Expense> findByDate(LocalDate date);
    List<Expense> findByDateBetween(LocalDate startDate, LocalDate endDate);
    List<Expense> findByEmployee(Employee employee);
    List<Expense> findByEmployeeAndDateBetween(Employee employee, LocalDate startDate, LocalDate endDate);
}
