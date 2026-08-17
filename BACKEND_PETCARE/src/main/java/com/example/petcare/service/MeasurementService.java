package com.example.petcare.service;

import com.example.petcare.entity.Measurement;
import com.example.petcare.repository.MeasurementRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MeasurementService {

    private final MeasurementRepository repo;

    public MeasurementService(MeasurementRepository repo) {
        this.repo = repo;
    }

    public Measurement add(Long petId, Measurement m) {
        m.setPetId(petId);
        return repo.save(m);
    }

    public List<Measurement> list(Long petId) {
        return repo.findByPetIdOrderByRecordedAtAsc(petId);
    }
}
