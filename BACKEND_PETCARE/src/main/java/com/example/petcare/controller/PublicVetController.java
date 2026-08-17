package com.example.petcare.controller;

import com.example.petcare.entity.VetProfile;
import com.example.petcare.repository.VetProfileRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vets")
public class PublicVetController {

    private final VetProfileRepository vetRepo;

    public PublicVetController(VetProfileRepository vetRepo) {
        this.vetRepo = vetRepo;
    }

    // OWNER can view only approved vets
    @GetMapping
    public ResponseEntity<List<VetProfile>> listApprovedVets() {
        return ResponseEntity.ok(vetRepo.findAllByApprovedTrue());
    }

    // Single vet detail (also blocked if not approved)
    @GetMapping("/{id}")
    public ResponseEntity<VetProfile> getVet(@PathVariable Long id) {
        return vetRepo.findById(id)
                .filter(VetProfile::isApproved)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
