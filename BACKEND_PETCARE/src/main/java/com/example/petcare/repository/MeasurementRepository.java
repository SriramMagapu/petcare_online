package com.example.petcare.repository;

import com.example.petcare.entity.Measurement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MeasurementRepository extends JpaRepository<Measurement, Long> {
	List<Measurement> findByPetIdOrderByRecordedAtAsc(Long petId);
}
