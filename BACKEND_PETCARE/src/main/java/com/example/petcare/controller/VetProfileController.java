package com.example.petcare.controller;

import com.example.petcare.entity.User;
import com.example.petcare.entity.VetProfile;
import com.example.petcare.repository.UserRepository;
import com.example.petcare.repository.VetProfileRepository;
import com.example.petcare.service.CloudinaryService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/vet")
public class VetProfileController {

    private final UserRepository userRepo;
    private final VetProfileRepository vetRepo;
    private final CloudinaryService cloudinaryService;

    public VetProfileController(
            UserRepository userRepo,
            VetProfileRepository vetRepo,
            CloudinaryService cloudinaryService
    ) {
        this.userRepo = userRepo;
        this.vetRepo = vetRepo;
        this.cloudinaryService = cloudinaryService;
    }

    /* ================= HELPERS ================= */

    private VetProfile getOrCreateProfile(String email) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return vetRepo.findByUserId(user.getId())
                .orElseGet(() -> {
                    VetProfile v = new VetProfile();
                    v.setUserId(user.getId());
                    v.setApproved(false);
                    return vetRepo.save(v);
                });
    }

    /* ================= GET PROFILE ================= */

    @GetMapping("/profile")
    public ResponseEntity<VetProfile> getProfile(
            @AuthenticationPrincipal String email
    ) {
        return ResponseEntity.ok(getOrCreateProfile(email));
    }

    /* ================= UPDATE PROFILE ================= */

    @PutMapping("/profile")
    public ResponseEntity<VetProfile> updateProfile(
            @AuthenticationPrincipal String email,
            @RequestBody VetProfile updated
    ) {
        VetProfile profile = getOrCreateProfile(email);

        profile.setName(updated.getName());
        profile.setClinicName(updated.getClinicName());
        profile.setSpecialization(updated.getSpecialization());
        profile.setPhone(updated.getPhone());
        profile.setClinicAddress(updated.getClinicAddress());

        vetRepo.save(profile);
        return ResponseEntity.ok(profile);
    }

    /* ================= PHOTO UPLOAD ================= */

    @PostMapping(
        value = "/profile/photo",
        consumes = "multipart/form-data"
    )
    public ResponseEntity<?> uploadPhoto(
            @AuthenticationPrincipal String email,
            @RequestParam("file") MultipartFile file
    ) throws Exception {

        if (file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }

        VetProfile profile = getOrCreateProfile(email);

        String uploadedUrl = cloudinaryService.uploadFile(file, "vets/user_" + profile.getUserId());
        if (uploadedUrl != null) {
            profile.setPhotoPath(uploadedUrl);
            vetRepo.save(profile);
        }

        return ResponseEntity.ok("Vet photo uploaded");
    }

    /* ================= CERTIFICATE UPLOAD ================= */

    @PostMapping(
        value = "/profile/certificate",
        consumes = "multipart/form-data"
    )
    public ResponseEntity<?> uploadCertificate(
            @AuthenticationPrincipal String email,
            @RequestParam("file") MultipartFile file
    ) throws Exception {

        if (file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }

        VetProfile profile = getOrCreateProfile(email);

        String uploadedUrl = cloudinaryService.uploadFile(file, "certificates/user_" + profile.getUserId());
        if (uploadedUrl != null) {
            profile.setCertificatePath(uploadedUrl);
            profile.setApproved(false);
            vetRepo.save(profile);
        }

        return ResponseEntity.ok("Certificate uploaded, pending admin approval");
    }
}
