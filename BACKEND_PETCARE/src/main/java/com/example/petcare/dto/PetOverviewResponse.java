package com.example.petcare.dto;

import com.example.petcare.entity.*;
import java.util.List;

public class PetOverviewResponse {

    private Pet pet;
    private List<MedicalRecord> medicalHistory;
    private List<Vaccination> vaccinations;
    private List<Measurement> measurements;
    private Vaccination nextVaccination;
    
    private String ownerName;

    public String getOwnerName() { return ownerName; }
    public void setOwnerName(String ownerName) { this.ownerName = ownerName; }


    // getters & setters
    public Pet getPet() { return pet; }
    public void setPet(Pet pet) { this.pet = pet; }

    public List<MedicalRecord> getMedicalHistory() { return medicalHistory; }
    public void setMedicalHistory(List<MedicalRecord> medicalHistory) {
        this.medicalHistory = medicalHistory;
    }

    public List<Vaccination> getVaccinations() { return vaccinations; }
    public void setVaccinations(List<Vaccination> vaccinations) {
        this.vaccinations = vaccinations;
    }

    public List<Measurement> getMeasurements() { return measurements; }
    public void setMeasurements(List<Measurement> measurements) {
        this.measurements = measurements;
    }

    public Vaccination getNextVaccination() { return nextVaccination; }
    public void setNextVaccination(Vaccination nextVaccination) {
        this.nextVaccination = nextVaccination;
    }
}
