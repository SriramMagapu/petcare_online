package com.example.petcare.controller;

import com.example.petcare.dto.EmailRequest;
import com.example.petcare.dto.OtpVerifyRequest;
import com.example.petcare.dto.RegisterRequest;
import com.example.petcare.entity.User;
import com.example.petcare.entity.OwnerProfile;
import com.example.petcare.entity.VetProfile;
import com.example.petcare.repository.UserRepository;
import com.example.petcare.repository.OwnerProfileRepository;
import com.example.petcare.repository.VetProfileRepository;
import com.example.petcare.service.OtpService;
import com.example.petcare.service.JwtService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import jakarta.transaction.Transactional;

import java.time.Instant;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping({"/api/auth", "/auth"})
public class AuthController {

    private final OtpService otpService;
    private final UserRepository userRepository;
    private final OwnerProfileRepository ownerProfileRepository;
    private final VetProfileRepository vetProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthController(
            OtpService otpService,
            UserRepository userRepository,
            OwnerProfileRepository ownerProfileRepository,
            VetProfileRepository vetProfileRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {
        this.otpService = otpService;
        this.userRepository = userRepository;
        this.ownerProfileRepository = ownerProfileRepository;
        this.vetProfileRepository = vetProfileRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    // ================= SEND OTP =================
    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(@RequestBody EmailRequest request) {

        if (request == null || request.getEmail() == null || request.getEmail().isBlank()) {
            return ResponseEntity.status(400)
                    .body(Map.of("message", "Email is required"));
        }

        String email = request.getEmail().trim().toLowerCase();

        if (request.isLogin()) {
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(404)
                        .body(Map.of("message", "User not found. Please register first."));
            }

            User user = userOpt.get();
            if (request.getPassword() == null || !passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
                return ResponseEntity.status(401)
                        .body(Map.of("message", "Invalid email or password"));
            }
        }

        otpService.generateAndSendOtp(email);
        return ResponseEntity.ok(Map.of("message", "otp_sent"));
    }

    // ================= VERIFY OTP =================
    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody OtpVerifyRequest req) {

        if (req == null || req.getEmail() == null || req.getOtp() == null) {
            return ResponseEntity.status(400)
                    .body(Map.of("message", "Email and OTP are required"));
        }

        String email = req.getEmail().trim().toLowerCase();

        if (!otpService.validateOtp(email, req.getOtp())) {
            return ResponseEntity.status(401)
                    .body(Map.of("message", "Invalid or expired OTP"));
        }

        otpService.evictOtp(email);

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404)
                    .body(Map.of("message", "User not found"));
        }
        User user = userOpt.get();

        System.out.println("🧠 ROLE FROM DB = " + user.getRole());

        String token = jwtService.createToken(
                user.getEmail(),
                user.getRole()
        );

        return ResponseEntity.ok(Map.of(
                "token", token,
                "email", user.getEmail(),
                "role", user.getRole()
        ));
    }

    // ================= REGISTER =================
    @PostMapping("/register")
    @Transactional
    public ResponseEntity<?> register(@RequestBody RegisterRequest req) {

        String email = req.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(email)) {
            return ResponseEntity.status(409)
                    .body(Map.of("message", "Email already exists"));
        }

        // 🔒 ROLE LOCK — frontend CANNOT create ADMIN
        String role = "OWNER";
        if ("VET".equalsIgnoreCase(req.getRole())) {
            role = "VET";
        }

        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(req.getPassword()));
        user.setRole(role);
        user.setCreatedAt(Instant.now());

        User saved = userRepository.save(user);

        if ("OWNER".equals(role)) {
            OwnerProfile owner = new OwnerProfile();
            owner.setUserId(saved.getId());
            owner.setEmail(saved.getEmail());
            owner.setName(req.getOwnerName());
            owner.setPhone(req.getOwnerPhone());
            owner.setAddress(req.getOwnerAddress());
            ownerProfileRepository.save(owner);
        }

        if ("VET".equals(role)) {
            VetProfile vet = new VetProfile();
            vet.setUserId(saved.getId());
            vet.setName(req.getVetName());
            vet.setClinicName(req.getClinicName());
            vet.setSpecialization(req.getSpecialization());
            vet.setPhone(req.getVetPhone());
            vet.setClinicAddress(req.getClinicAddress());
            vet.setApproved(false); // admin approval required
            vetProfileRepository.save(vet);
        }

        return ResponseEntity.ok(Map.of("message", "User registered"));
    }
}
