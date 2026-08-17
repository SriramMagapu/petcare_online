package com.example.petcare.controller;

import com.example.petcare.dto.AdminOwnerDTO;
import com.example.petcare.dto.AdminOwnerDetailDTO;
import com.example.petcare.dto.AdminUserOverviewDTO;
import com.example.petcare.dto.AdminVetDTO;
import com.example.petcare.entity.*;
import com.example.petcare.repository.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserRepository userRepository;
    private final VetProfileRepository vetProfileRepository;
    private final OwnerProfileRepository ownerProfileRepository;
    private final PetRepository petRepository;

    public AdminController(
            UserRepository userRepository,
            VetProfileRepository vetProfileRepository,
            OwnerProfileRepository ownerProfileRepository,
            PetRepository petRepository
    ) {
        this.userRepository = userRepository;
        this.vetProfileRepository = vetProfileRepository;
        this.ownerProfileRepository = ownerProfileRepository;
        this.petRepository = petRepository;
    }

    // ✅ USER MANAGEMENT (ALL USERS)
    @GetMapping("/users/overview")
    public ResponseEntity<List<AdminUserOverviewDTO>> userOverview() {

        List<AdminUserOverviewDTO> result =
            userRepository.findAll().stream().map(user -> {

                AdminUserOverviewDTO dto = new AdminUserOverviewDTO();
                dto.id = user.getId();
                dto.email = user.getEmail();
                dto.role = user.getRole();
                dto.createdAt = user.getCreatedAt().toString();

                // 🔑 NAME RESOLUTION
                if ("OWNER".equals(user.getRole())) {
                    ownerProfileRepository.findByUserId(user.getId())
                        .ifPresent(op -> dto.name = op.getName());

                    dto.pets = petRepository.findByOwnerId(user.getId());
                }

                if ("VET".equals(user.getRole())) {
                    vetProfileRepository.findByUserId(user.getId())
                        .ifPresent(vp -> {
                            dto.name = vp.getName();
                            dto.vetProfile = vp;
                        });
                }

                if ("ADMIN".equals(user.getRole())) {
                    dto.name = "Admin";
                }

                // fallback safety
                if (dto.name == null) {
                    dto.name = user.getEmail();
                }

                return dto;
            }).toList();

        return ResponseEntity.ok(result);
    }

    // ✅ APPROVE VET
    @PutMapping("/vets/{userId}/approve")
    public ResponseEntity<String> approveVet(@PathVariable Long userId) {

        VetProfile vet = vetProfileRepository.findByUserId(userId)
            .orElseThrow(() -> new RuntimeException("Vet profile not found"));

        vet.setApproved(true);
        vetProfileRepository.save(vet);

        return ResponseEntity.ok("Vet approved");
    }

    // 🚫 BLOCK VET
    @PutMapping("/vets/{userId}/block")
    public ResponseEntity<String> blockVet(@PathVariable Long userId) {

        VetProfile vet = vetProfileRepository.findByUserId(userId)
            .orElseThrow(() -> new RuntimeException("Vet profile not found"));

        vet.setApproved(false);
        vetProfileRepository.save(vet);

        return ResponseEntity.ok("Vet blocked");
    }
    
    // Get Owner Details in the Admin Panel
    
    @GetMapping("/users/{userId}")
    public ResponseEntity<?> getOwnerDetails(@PathVariable Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!"OWNER".equals(user.getRole())) {
            return ResponseEntity.badRequest().body("User is not an owner");
        }

        AdminOwnerDetailDTO dto = new AdminOwnerDetailDTO();
        dto.setUserId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setCreatedAt(user.getCreatedAt().toString());

        ownerProfileRepository.findByUserId(userId)
                .ifPresent(op -> dto.setName(op.getName()));

        List<Pet> pets = petRepository.findByOwnerId(userId);
        dto.setPets(pets);
        dto.setPetCount(pets.size());

        return ResponseEntity.ok(dto);
    }
    
    // Get Vet Details in the Admin Panel
    
    @GetMapping("/vets/{userId}")
    public ResponseEntity<?> getVetDetails(@PathVariable Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!"VET".equals(user.getRole())) {
            return ResponseEntity.badRequest().body("User is not a vet");
        }

        VetProfile vetProfile = vetProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Vet profile not found"));

        AdminVetDTO dto = new AdminVetDTO();
        dto.setUserId(user.getId());
        dto.setVetProfileId(vetProfile.getId());
        dto.setEmail(user.getEmail());
        dto.setName(vetProfile.getName());
        dto.setSpecialization(vetProfile.getSpecialization());
        dto.setApproved(vetProfile.isApproved());
        dto.setCertificatePath(vetProfile.getCertificatePath());

        return ResponseEntity.ok(dto);
    }


}
