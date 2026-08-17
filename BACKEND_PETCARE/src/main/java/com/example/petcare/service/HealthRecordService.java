package com.example.petcare.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.petcare.entity.HealthRecord;
import com.example.petcare.repository.HealthRecordRepository;

@Service
public class HealthRecordService {

    private final HealthRecordRepository repo;

    public HealthRecordService(HealthRecordRepository repo) {
        this.repo = repo;
    }

    public HealthRecord add(Long petId, HealthRecord r) {
        r.setPetId(petId);
        return repo.save(r);
    }

    public List<HealthRecord> list(Long petId) {
        return repo.findByPetIdOrderByRecordDateAsc(petId);
    }
}
