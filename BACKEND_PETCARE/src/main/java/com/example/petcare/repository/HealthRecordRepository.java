package com.example.petcare.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.petcare.entity.HealthRecord;

public interface HealthRecordRepository extends JpaRepository<HealthRecord, Long> {

	List<HealthRecord> findByPetIdOrderByRecordDateAsc(Long petId);
}
