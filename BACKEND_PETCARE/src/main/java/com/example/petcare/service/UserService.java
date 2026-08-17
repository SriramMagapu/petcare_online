package com.example.petcare.service;

import com.example.petcare.entity.OwnerProfile;
import com.example.petcare.entity.User;
import com.example.petcare.entity.VetProfile;
import com.example.petcare.repository.OwnerProfileRepository;
import com.example.petcare.repository.UserRepository;
import com.example.petcare.repository.VetProfileRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.security.crypto.password.PasswordEncoder;


import java.io.File;
import java.io.IOException;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepo;
    private final OwnerProfileRepository ownerRepo;
    private final VetProfileRepository vetRepo;
    private final JavaMailSenderAdapter mailAdapter;
    private final PasswordEncoder passwordEncoder;
    private final CloudinaryService cloudinaryService;

    public UserService(UserRepository userRepo,
            OwnerProfileRepository ownerRepo,
            VetProfileRepository vetRepo,
            JavaMailSenderAdapter mailAdapter,
            PasswordEncoder passwordEncoder,
            CloudinaryService cloudinaryService) {
        this.userRepo = userRepo;
        this.ownerRepo = ownerRepo;
        this.vetRepo = vetRepo;
        this.mailAdapter = mailAdapter;
        this.passwordEncoder = passwordEncoder;
        this.cloudinaryService = cloudinaryService;
    }

    public boolean existsByEmail(String email) {
        return userRepo.existsByEmail(email);
    }

    public User saveUser(User user) {
        return userRepo.save(user);
    }

    public Optional<User> findByEmail(String email) {
        return userRepo.findByEmail(email);
    }

    public void sendWelcomeEmail(String to) {
        mailAdapter.sendSimple(to, "Welcome to PetCare", "Thanks for creating an account in PetCare!");
    }

    public String savePhotoToDisk(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) return null;
        return cloudinaryService.uploadFile(file, "users");
    }

    // Create owner profile and return it
    public OwnerProfile createOwnerProfile(Long userId, String name, String phone, String address, String photoPath) {
        OwnerProfile p = new OwnerProfile();
        p.setUserId(userId);
        p.setName(name);
        p.setPhone(phone);
        p.setAddress(address);
        p.setPhotoPath(photoPath);
        return ownerRepo.save(p);
    }

    // Create vet profile and return it (important: returns VetProfile)
    public VetProfile createVetProfile(Long userId, String name, String clinicName, String specialization, String phone, String clinicAddress) {
        VetProfile p = new VetProfile();
        p.setUserId(userId);
        p.setName(name);
        p.setClinicName(clinicName);
        p.setSpecialization(specialization);
        p.setPhone(phone);
        p.setClinicAddress(clinicAddress);
        return vetRepo.save(p);   // <- this is the exact line you reported an error on
    }
    public void changePassword(String email, String oldPassword, String newPassword) {

        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        //  Verify old password
        if (!passwordEncoder.matches(oldPassword, user.getPasswordHash())) {
            throw new RuntimeException("Old password is incorrect");
        }

        // Encode and save new password
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepo.save(user);
    }


}
