package com.example.petcare.controller;

import com.example.petcare.entity.Pet;
import com.example.petcare.service.PetService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/pets")
public class PetController {

    private final PetService petService;

    public PetController(PetService petService) {
        this.petService = petService;
    }

    /* ================= CREATE ================= */

    @PostMapping
    public ResponseEntity<Pet> create(
            @RequestBody Pet pet,
            @AuthenticationPrincipal String email   // ✅ FIXED
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(petService.createPet(pet, email));
    }

    /* ================= READ ================= */

    @GetMapping
    public ResponseEntity<List<Pet>> myPets(
            @AuthenticationPrincipal String email
    ) {
        return ResponseEntity.ok(petService.getMyPets(email));
    }

    @GetMapping("/{petId}")
    public ResponseEntity<Pet> getPet(
            @PathVariable Long petId,
            @AuthenticationPrincipal String email
    ) {
        return ResponseEntity.ok(petService.getPet(petId, email));
    }

    /* ================= UPDATE ================= */

    @PutMapping("/{petId}")
    public ResponseEntity<Pet> updatePet(
            @PathVariable Long petId,
            @RequestBody Pet pet,
            @AuthenticationPrincipal String email
    ) {
        return ResponseEntity.ok(
                petService.updatePet(petId, pet, email)
        );
    }

    /* ================= DELETE ================= */

    @DeleteMapping("/{petId}")
    public ResponseEntity<Void> deletePet(
            @PathVariable Long petId,
            @AuthenticationPrincipal String email
    ) {
        petService.deletePet(petId, email);
        return ResponseEntity.noContent().build();
    }

    /* ================= PHOTO UPLOAD ================= */

    @PostMapping("/{petId}/photo")
    public ResponseEntity<?> uploadPetPhoto(
            @PathVariable Long petId,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal String email
    ) throws IOException {

        petService.savePetPhoto(petId, file, email);
        return ResponseEntity.ok("Pet photo uploaded successfully");
    }

    /* ================= OWNER OVERVIEW ================= */

    @GetMapping("/{petId}/overview")
    public ResponseEntity<?> overview(
            @PathVariable Long petId,
            @AuthenticationPrincipal String email
    ) {
        return ResponseEntity.ok(
                petService.getPetOverview(petId, email)
        );
    }

    /* ================= VET OVERVIEW ================= */

    @GetMapping("/{petId}/overview/vet")
    public ResponseEntity<?> vetOverview(@PathVariable Long petId) {
        return ResponseEntity.ok(
                petService.getPetOverviewForVet(petId)
        );
    }
}
