package com.nmdecor.staff_tracker.service;

import com.nmdecor.staff_tracker.dto.AttendanceDto;
import com.nmdecor.staff_tracker.exception.ResourceNotFoundException;
import com.nmdecor.staff_tracker.model.Attendance;
import com.nmdecor.staff_tracker.model.Employee;
import com.nmdecor.staff_tracker.repository.AttendanceRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final EmployeeService employeeService;

    public AttendanceService(AttendanceRepository attendanceRepository, EmployeeService employeeService) {
        this.attendanceRepository = attendanceRepository;
        this.employeeService = employeeService;
    }

    public List<AttendanceDto> getAllAttendance() {
        return attendanceRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<AttendanceDto> getAttendanceByDate(LocalDate date) {
        return attendanceRepository.findByDate(date).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<AttendanceDto> getAttendanceByDateRange(LocalDate startDate, LocalDate endDate) {
        return attendanceRepository.findByDateBetween(startDate, endDate).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<AttendanceDto> getAttendanceByEmployee(Long employeeId) {
        Employee employee = employeeService.getEmployeeEntityById(employeeId);
        return attendanceRepository.findByEmployee(employee).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public AttendanceDto markAttendance(AttendanceDto attendanceDto) {
        Employee employee = employeeService.getEmployeeEntityById(attendanceDto.getEmployeeId());
        
        // Check if attendance record already exists for this employee and date
        Optional<Attendance> existingAttendance = attendanceRepository.findByEmployeeAndDate(employee, attendanceDto.getDate());
        
        Attendance attendance;
        if (existingAttendance.isPresent()) {
            // Update existing record
            attendance = existingAttendance.get();
            attendance.setPresent(attendanceDto.getPresent());
        } else {
            // Create new record
            attendance = new Attendance();
            attendance.setEmployee(employee);
            attendance.setDate(attendanceDto.getDate());
            attendance.setPresent(attendanceDto.getPresent());
        }
        
        Attendance savedAttendance = attendanceRepository.save(attendance);
        return convertToDto(savedAttendance);
    }

    private AttendanceDto convertToDto(Attendance attendance) {
        return new AttendanceDto(
                attendance.getId(),
                attendance.getEmployee().getId(),
                attendance.getEmployee().getName(),
                attendance.getDate(),
                attendance.isPresent()
        );
    }
}
