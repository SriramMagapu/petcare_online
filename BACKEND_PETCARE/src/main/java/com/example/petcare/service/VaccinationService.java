package com.example.petcare.service;

import com.example.petcare.entity.Vaccination;
import com.example.petcare.repository.VaccinationRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class VaccinationService {

    private final VaccinationRepository repo;

    public VaccinationService(VaccinationRepository repo) {
        this.repo = repo;
    }

    public Vaccination create(Vaccination v) {
        return repo.save(v);
    }

    public List<Vaccination> getByPet(Long petId) {
        return repo.findByPetId(petId);
    }

    public void delete(Long id) {
        repo.deleteById(id);
    }
}
