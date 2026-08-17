package com.example.petcare.service;

import com.example.petcare.entity.Attachment;
import com.example.petcare.entity.MedicalRecord;
import com.example.petcare.repository.AttachmentRepository;
import com.example.petcare.repository.MedicalRecordRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.List;
import java.util.UUID;

@Service
public class MedicalRecordService {

    private final MedicalRecordRepository repo;

    public MedicalRecordService(MedicalRecordRepository repo) {
        this.repo = repo;
    }

    public MedicalRecord create(MedicalRecord record) {
        return repo.save(record);
    }

    public List<MedicalRecord> getByPet(Long petId) {
        return repo.findByPetIdOrderByVisitDateDesc(petId);
    }

    public void delete(Long id) {
        repo.deleteById(id);
    }
}
