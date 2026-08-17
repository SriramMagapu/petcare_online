package com.example.petcare.service;

import com.example.petcare.dto.*;
import com.example.petcare.entity.*;
import com.example.petcare.repository.*;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final OwnerProfileRepository ownerProfileRepository;
    private final VetProfileRepository vetProfileRepository;
    private final PetRepository petRepository;

    public AdminService(
            UserRepository userRepository,
            OwnerProfileRepository ownerProfileRepository,
            VetProfileRepository vetProfileRepository,
            PetRepository petRepository
    ) {
        this.userRepository = userRepository;
        this.ownerProfileRepository = ownerProfileRepository;
        this.vetProfileRepository = vetProfileRepository;
        this.petRepository = petRepository;
    }

    public AdminOverviewResponse getAdminOverview() {

        AdminOverviewResponse response = new AdminOverviewResponse();

        // -------- OWNERS --------
        List<AdminOwnerDTO> owners = userRepository.findAll().stream()
                .filter(u -> "OWNER".equals(u.getRole()))
                .map(u -> {
                    AdminOwnerDTO dto = new AdminOwnerDTO();
                    dto.setUserId(u.getId());
                    dto.setEmail(u.getEmail());

                    ownerProfileRepository.findByUserId(u.getId()).ifPresent(op -> {
                        List<Pet> pets = petRepository.findByOwnerId(op.getId());
                        dto.setPets(pets);
                        dto.setPetCount(pets.size());
                    });

                    return dto;
                })
                .collect(Collectors.toList());

        // -------- VETS --------
        List<AdminVetDTO> vets = userRepository.findAll().stream()
                .filter(u -> "VET".equals(u.getRole()))
                .map(u -> {
                    AdminVetDTO dto = new AdminVetDTO();
                    dto.setUserId(u.getId());
                    dto.setEmail(u.getEmail());

                    vetProfileRepository.findByUserId(u.getId()).ifPresent(v -> {
                        dto.setVetProfileId(v.getId());
                        dto.setName(v.getName());
                        dto.setSpecialization(v.getSpecialization());
                        dto.setApproved(v.isApproved());
                        dto.setCertificatePath(v.getCertificatePath());
                    });

                    return dto;
                })
                .collect(Collectors.toList());

        response.setOwners(owners);
        response.setVets(vets);

        return response;
    }

    // -------- ADMIN ACTIONS --------
    public void approveVet(Long vetProfileId) {
        VetProfile vet = vetProfileRepository.findById(vetProfileId)
                .orElseThrow(() -> new RuntimeException("Vet not found"));
        vet.setApproved(true);
        vetProfileRepository.save(vet);
    }

    public void blockVet(Long vetProfileId) {
        VetProfile vet = vetProfileRepository.findById(vetProfileId)
                .orElseThrow(() -> new RuntimeException("Vet not found"));
        vet.setApproved(false);
        vetProfileRepository.save(vet);
    }
}
