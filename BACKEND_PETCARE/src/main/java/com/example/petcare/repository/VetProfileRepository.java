package com.example.petcare.repository;

import com.example.petcare.entity.VetProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface VetProfileRepository extends JpaRepository<VetProfile, Long> {
    Optional<VetProfile> findByUserId(Long userId);
    List<VetProfile> findAllByApprovedTrue();
}
