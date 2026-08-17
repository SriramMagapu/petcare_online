package com.example.petcare.service;

import com.example.petcare.dto.PetOverviewResponse;
import com.example.petcare.entity.*;
import com.example.petcare.repository.*;

import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.*;
import java.util.List;

@Service
public class PetService {
	private final OwnerProfileRepository ownerProfileRepository;
    private final PetRepository petRepository;
    private final UserRepository userRepository;
    private final MedicalRecordRepository medicalRecordRepository;
    private final VaccinationRepository vaccinationRepository;
    private final MeasurementRepository measurementRepository;
    private final CloudinaryService cloudinaryService;

    // base upload folder
    private static final String BASE_UPLOAD_DIR = "uploads";

    public PetService(	
    		OwnerProfileRepository ownerProfileRepository,
            PetRepository petRepository,
            UserRepository userRepository,
            MedicalRecordRepository medicalRecordRepository,
            VaccinationRepository vaccinationRepository,
            MeasurementRepository measurementRepository,
            CloudinaryService cloudinaryService
    ) {
    	this.ownerProfileRepository = ownerProfileRepository;
        this.petRepository = petRepository;
        this.userRepository = userRepository;
        this.medicalRecordRepository = medicalRecordRepository;
        this.vaccinationRepository = vaccinationRepository;
        this.measurementRepository = measurementRepository;
        this.cloudinaryService = cloudinaryService;
    }


    // ---------------- CREATE ----------------
    public Pet createPet(Pet pet, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        OwnerProfile ownerProfile = ownerProfileRepository
                .findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Owner profile not found"));

        pet.setOwnerId(ownerProfile.getId()); // ✅ CORRECT FK
        return petRepository.save(pet);
    }


    // ---------------- READ ----------------
    public List<Pet> getMyPets(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        OwnerProfile ownerProfile = ownerProfileRepository
                .findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Owner profile not found"));

        return petRepository.findByOwnerId(ownerProfile.getId());

    }

    public Pet getPet(Long petId, String email) {
        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new RuntimeException("Pet not found"));

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        OwnerProfile ownerProfile = ownerProfileRepository
                .findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Owner profile not found"));

        if (!pet.getOwnerId().equals(ownerProfile.getId())) {
            throw new RuntimeException("Unauthorized access");
        }


        return pet;
    }

    // ---------------- UPDATE ----------------
    public Pet updatePet(Long petId, Pet updated, String email) {
        Pet pet = getPet(petId, email);

        pet.setName(updated.getName());
        pet.setSpecies(updated.getSpecies());
        pet.setBreed(updated.getBreed());
        pet.setDob(updated.getDob());
        pet.setGender(updated.getGender());
        pet.setHealthStatus(updated.getHealthStatus());
        pet.setMicrochipId(updated.getMicrochipId());

        return petRepository.save(pet);
    }

    // ---------------- DELETE ----------------
    public void deletePet(Long petId, String email) {
        petRepository.delete(getPet(petId, email));
    }

    // =======================Photo one =======================
    

    public void savePetPhoto(Long petId, MultipartFile file, String email) throws IOException {
        Pet pet = getPet(petId, email); // owner validation inside
        String uploadedUrl = cloudinaryService.uploadFile(file, "pets/owner_" + pet.getOwnerId() + "_pet_" + pet.getId());
        if (uploadedUrl != null) {
            pet.setPhotoPath(uploadedUrl);
            petRepository.save(pet);
        }
    }

    public Resource loadPetPhotoPublic(Long petId) {

        Pet pet = petRepository.findById(petId).orElse(null);
        if (pet == null) return null;

        if (pet.getPhotoPath() == null) return null;

        File file = new File(
            System.getProperty("user.dir") +
            File.separator + "uploads" +
            File.separator + pet.getPhotoPath()
        );

        if (!file.exists()) return null;

        return new FileSystemResource(file);
    }


    public PetOverviewResponse getPetOverview(Long petId, String email) {

        // ownership check (already implemented)
        Pet pet = getPet(petId, email);

        List<MedicalRecord> records =
                medicalRecordRepository.findByPetIdOrderByVisitDateDesc(petId);

        List<Vaccination> vaccinations =
                vaccinationRepository.findByPetId(petId);

        List<Measurement> measurements =
                measurementRepository.findByPetIdOrderByRecordedAtAsc(petId);

        Vaccination nextVaccination = vaccinations.stream()
                .filter(v -> v.getNextDueDate() != null)
                .sorted((a, b) -> a.getNextDueDate().compareTo(b.getNextDueDate()))
                .findFirst()
                .orElse(null);

        PetOverviewResponse response = new PetOverviewResponse();
        response.setPet(pet);
        response.setMedicalHistory(records);
        response.setVaccinations(vaccinations);
        response.setMeasurements(measurements);
        response.setNextVaccination(nextVaccination);

        return response;
    }
    public Pet getPetForVet(Long petId) {
        return petRepository.findById(petId)
                .orElseThrow(() -> new RuntimeException("Pet not found"));
    }
    public PetOverviewResponse getPetOverviewForVet(Long petId) {

        Pet pet = getPetForVet(petId);

        // fetch owner profile
        OwnerProfile owner = ownerProfileRepository
                .findById(pet.getOwnerId())
                .orElse(null);

        List<MedicalRecord> records =
                medicalRecordRepository.findByPetIdOrderByVisitDateDesc(petId);

        List<Vaccination> vaccinations =
                vaccinationRepository.findByPetId(petId);

        List<Measurement> measurements =
                measurementRepository.findByPetIdOrderByRecordedAtAsc(petId);

        PetOverviewResponse response = new PetOverviewResponse();
        response.setPet(pet);
        response.setOwnerName(owner != null ? owner.getName() : null);   // ⬅️ added
        response.setMedicalHistory(records);
        response.setVaccinations(vaccinations);
        response.setMeasurements(measurements);

        return response;
    }



}
