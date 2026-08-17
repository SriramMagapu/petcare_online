package com.example.petcare.service;

import com.example.petcare.config.SecurityConfig;
import com.example.petcare.dto.ReportDTO;
import com.example.petcare.repository.AppointmentRepository;
import com.example.petcare.repository.OrderRepository;
import com.example.petcare.repository.UserRepository;

import org.springframework.stereotype.Service;

@Service
public class AdminReportService {

    private final OrderRepository orderRepo;
    private final AppointmentRepository appointmentRepo;
    private final UserRepository userRepo;

    public AdminReportService(OrderRepository orderRepo,
                              AppointmentRepository appointmentRepo,
                              UserRepository userRepo) {
        this.orderRepo = orderRepo;
        this.appointmentRepo = appointmentRepo;
        this.userRepo = userRepo;
    }

    public ReportDTO generateReport() {
        ReportDTO dto = new ReportDTO();

        dto.totalRevenue = orderRepo.sumDeliveredRevenue();
        dto.averageOrderValue = orderRepo.averageOrderValue();
        dto.topProduct = orderRepo.findTopSellingProduct();
        dto.activeUsers = userRepo.count();
        dto.totalAppointments = appointmentRepo.count();
        dto.completedAppointments = appointmentRepo.countByStatus("COMPLETED");

        return dto;
    }
}
