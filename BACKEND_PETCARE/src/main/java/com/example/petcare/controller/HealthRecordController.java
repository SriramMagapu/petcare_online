package com.example.petcare.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.petcare.entity.HealthRecord;
import com.example.petcare.service.HealthRecordService;

@RestController
@RequestMapping("/api/pets/{petId}/health")
public class HealthRecordController {

    private final HealthRecordService service;

    public HealthRecordController(HealthRecordService service) {
        this.service = service;
    }

    @PostMapping
    public HealthRecord add(
            @PathVariable Long petId,
            @RequestBody HealthRecord r) {
        return service.add(petId, r);
    }

    @GetMapping
    public List<HealthRecord> list(@PathVariable Long petId) {
        return service.list(petId);
    }
}
