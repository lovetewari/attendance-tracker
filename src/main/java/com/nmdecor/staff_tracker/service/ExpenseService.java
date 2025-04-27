package com.nmdecor.staff_tracker.service;

import com.nmdecor.staff_tracker.dto.ExpenseDto;
import com.nmdecor.staff_tracker.exception.ResourceNotFoundException;
import com.nmdecor.staff_tracker.model.Employee;
import com.nmdecor.staff_tracker.model.Expense;
import com.nmdecor.staff_tracker.repository.ExpenseRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final EmployeeService employeeService;

    public ExpenseService(ExpenseRepository expenseRepository, EmployeeService employeeService) {
        this.expenseRepository = expenseRepository;
        this.employeeService = employeeService;
    }

    public List<ExpenseDto> getAllExpenses() {
        return expenseRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public ExpenseDto getExpenseById(Long id) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found with id: " + id));
        return convertToDto(expense);
    }

    public List<ExpenseDto> getExpensesByDate(LocalDate date) {
        return expenseRepository.findByDate(date).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<ExpenseDto> getExpensesByDateRange(LocalDate startDate, LocalDate endDate) {
        return expenseRepository.findByDateBetween(startDate, endDate).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<ExpenseDto> getExpensesByEmployee(Long employeeId) {
        Employee employee = employeeService.getEmployeeEntityById(employeeId);
        return expenseRepository.findByEmployee(employee).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public ExpenseDto createExpense(ExpenseDto expenseDto) {
        Employee employee = employeeService.getEmployeeEntityById(expenseDto.getEmployeeId());
        
        Expense expense = new Expense();
        expense.setEmployee(employee);
        expense.setDate(expenseDto.getDate());
        expense.setAmount(expenseDto.getAmount());
        expense.setCategory(expenseDto.getCategory());
        expense.setDescription(expenseDto.getDescription());
        
        Expense savedExpense = expenseRepository.save(expense);
        return convertToDto(savedExpense);
    }

    public ExpenseDto updateExpense(Long id, ExpenseDto expenseDto) {
        Expense existingExpense = expenseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found with id: " + id));
        
        Employee employee = employeeService.getEmployeeEntityById(expenseDto.getEmployeeId());
        
        existingExpense.setEmployee(employee);
        existingExpense.setDate(expenseDto.getDate());
        existingExpense.setAmount(expenseDto.getAmount());
        existingExpense.setCategory(expenseDto.getCategory());
        existingExpense.setDescription(expenseDto.getDescription());
        
        Expense updatedExpense = expenseRepository.save(existingExpense);
        return convertToDto(updatedExpense);
    }

    public void deleteExpense(Long id) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found with id: " + id));
        expenseRepository.delete(expense);
    }

    private ExpenseDto convertToDto(Expense expense) {
        return new ExpenseDto(
                expense.getId(),
                expense.getEmployee().getId(),
                expense.getEmployee().getName(),
                expense.getDate(),
                expense.getAmount(),
                expense.getCategory(),
                expense.getDescription()
        );
    }
}
