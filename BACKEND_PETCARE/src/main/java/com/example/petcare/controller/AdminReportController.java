package com.example.petcare.controller;

import com.example.petcare.dto.ReportDTO;
import com.example.petcare.service.AdminReportService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
public class AdminReportController {

    private final AdminReportService reportService;

    public AdminReportController(AdminReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/reports")
    public ReportDTO getReports() {
        return reportService.generateReport();
    }
}
