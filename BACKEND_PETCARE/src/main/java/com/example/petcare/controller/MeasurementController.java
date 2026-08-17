package com.example.petcare.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.petcare.entity.Measurement;
import com.example.petcare.service.MeasurementService;

@RestController
@RequestMapping("/api/pets/{petId}")
public class MeasurementController {

    private final MeasurementService measurementService;

    public MeasurementController(MeasurementService measurementService) {
        this.measurementService = measurementService;
    }

    @PostMapping("/measurements")
    public ResponseEntity<Measurement> addMeasurement(
            @PathVariable Long petId,
            @RequestBody Measurement m) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(measurementService.add(petId, m));
    }

    @GetMapping("/measurements")
    public ResponseEntity<List<Measurement>> listMeasurements(
            @PathVariable Long petId) {

        return ResponseEntity.ok(measurementService.list(petId));
    }
}
