package com.example.petcare.repository;

import com.example.petcare.entity.UserOtp;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserOtpRepository extends JpaRepository<UserOtp, Long> {
    Optional<UserOtp> findTopByEmailAndUsedFalseOrderByExpiresAtDesc(String email);
}
