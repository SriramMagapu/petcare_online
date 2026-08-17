package com.example.petcare.controller;

import com.example.petcare.entity.MedicalRecord;
import com.example.petcare.entity.Vaccination;
import com.example.petcare.service.MedicalRecordService;
import com.example.petcare.service.VaccinationService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pets/{petId}")
public class MedicalRecordController {

    private final MedicalRecordService recordService;
    private final VaccinationService vaccinationService;

    public MedicalRecordController(
            MedicalRecordService recordService,
            VaccinationService vaccinationService) {

        this.recordService = recordService;
        this.vaccinationService = vaccinationService;
    }

    // ---------------- MEDICAL RECORDS ----------------

    @PostMapping("/records")
    public ResponseEntity<MedicalRecord> addRecord(
            @PathVariable Long petId,
            @RequestBody MedicalRecord rec) {

        rec.setPetId(petId);
        MedicalRecord saved = recordService.create(rec);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping("/records")
    public ResponseEntity<List<MedicalRecord>> listRecords(
            @PathVariable Long petId) {

        return ResponseEntity.ok(recordService.getByPet(petId));
    }

    // ---------------- VACCINATIONS ----------------

    @PostMapping("/vaccinations")
    public ResponseEntity<Vaccination> addVaccination(
            @PathVariable Long petId,
            @RequestBody Vaccination v) {

        v.setPetId(petId);
        Vaccination saved = vaccinationService.create(v);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping("/vaccinations")
    public ResponseEntity<List<Vaccination>> listVaccinations(
            @PathVariable Long petId) {

        return ResponseEntity.ok(vaccinationService.getByPet(petId));
    }

    @DeleteMapping("/vaccinations/{id}")
    public ResponseEntity<Void> deleteVaccination(
            @PathVariable Long petId,
            @PathVariable Long id) {

        vaccinationService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
