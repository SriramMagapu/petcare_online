package com.example.petcare.controller;

import com.example.petcare.entity.OwnerProfile;
import com.example.petcare.entity.User;
import com.example.petcare.repository.OwnerProfileRepository;
import com.example.petcare.repository.UserRepository;
import com.example.petcare.service.CloudinaryService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/owner")
public class OwnerProfileController {

    private final OwnerProfileRepository ownerRepo;
    private final UserRepository userRepo;
    private final CloudinaryService cloudinaryService;

    public OwnerProfileController(
            OwnerProfileRepository ownerRepo,
            UserRepository userRepo,
            CloudinaryService cloudinaryService
    ) {
        this.ownerRepo = ownerRepo;
        this.userRepo = userRepo;
        this.cloudinaryService = cloudinaryService;
    }

    /* ================= CORE ================= */

    private OwnerProfile getOrCreateProfile(String email) {

        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return ownerRepo.findByUserId(user.getId())
                .orElseGet(() -> {
                    OwnerProfile p = new OwnerProfile();
                    p.setUserId(user.getId());
                    p.setEmail(user.getEmail());
                    p.setName("");
                    p.setPhone("");
                    p.setAddress("");
                    return ownerRepo.save(p);
                });
    }

    /* ================= GET PROFILE ================= */

    @GetMapping("/profile")
    public ResponseEntity<OwnerProfile> getProfile(
            @AuthenticationPrincipal String email
    ) {
        return ResponseEntity.ok(getOrCreateProfile(email));
    }

    /* ================= UPDATE PROFILE ================= */

    @PutMapping("/profile")
    public ResponseEntity<OwnerProfile> updateProfile(
            @AuthenticationPrincipal String email,
            @RequestBody OwnerProfile updated
    ) {
        OwnerProfile profile = getOrCreateProfile(email);

        profile.setName(updated.getName());
        profile.setPhone(updated.getPhone());
        profile.setAddress(updated.getAddress());

        ownerRepo.save(profile);
        return ResponseEntity.ok(profile);
    }

    /* ================= UPLOAD PROFILE PHOTO ================= */

    @PostMapping("/profile/photo")
    public ResponseEntity<OwnerProfile> uploadPhoto(
            @AuthenticationPrincipal String email,
            @RequestParam("file") MultipartFile file
    ) throws Exception {

        if (file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }

        OwnerProfile profile = getOrCreateProfile(email);

        String uploadedUrl = cloudinaryService.uploadFile(file, "owners/user_" + profile.getUserId());
        if (uploadedUrl != null) {
            profile.setPhotoPath(uploadedUrl);
            ownerRepo.save(profile);
        }

        return ResponseEntity.ok(profile);
    }
}
