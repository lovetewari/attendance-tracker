package com.nmdecor.staff_tracker.config;

import com.nmdecor.staff_tracker.model.Employee;
import com.nmdecor.staff_tracker.repository.EmployeeRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import java.util.Arrays;
import java.util.List;

@Configuration
public class DataInitializer {

    @Bean
    @Profile("!test")
    public CommandLineRunner initData(EmployeeRepository employeeRepository) {
        return args -> {
            // Check if data already exists
            if (employeeRepository.count() == 0) {
                // Create initial employees
                List<Employee> employees = Arrays.asList(
                    new Employee("John Doe", "Designer", "john@nmdecor.com", "555-1234"),
                    new Employee("Jane Smith", "Carpenter", "jane@nmdecor.com", "555-2345"),
                    new Employee("Michael Johnson", "Painter", "michael@nmdecor.com", "555-3456"),
                    new Employee("Emily Davis", "Interior Designer", "emily@nmdecor.com", "555-4567"),
                    new Employee("Robert Wilson", "Electrician", "robert@nmdecor.com", "555-5678"),
                    new Employee("Sarah Brown", "Plumber", "sarah@nmdecor.com", "555-6789"),
                    new Employee("David Miller", "Architect", "david@nmdecor.com", "555-7890"),
                    new Employee("Jennifer Taylor", "Project Manager", "jennifer@nmdecor.com", "555-8901"),
                    new Employee("William Anderson", "Supervisor", "william@nmdecor.com", "555-9012"),
                    new Employee("Lisa Thomas", "Assistant", "lisa@nmdecor.com", "555-0123")
                );
                
                // Save all employees
                employeeRepository.saveAll(employees);
            }
        };
    }
}
