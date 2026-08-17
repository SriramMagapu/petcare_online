package com.example.petcare.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.Period;

@Entity
@Table(name = "pets")
public class Pet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    // Dog / Cat / Bird / etc
    private String species;

    private String breed;

    private LocalDate dob;

    private String gender;

    private String photoPath;

    
    @Column(unique = true)
    private String microchipId;

    
    @Column(columnDefinition = "TEXT")
    private String healthStatus;

    @Column(nullable = false)
    private Long ownerId;

    /* ---------------- DERIVED FIELD ---------------- */
    @Transient
    public Integer getAge() {
        if (dob == null) return null;
        return Period.between(dob, LocalDate.now()).getYears();
    }

    /* ---------------- GETTERS / SETTERS ---------------- */

    public Long getId() { return id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getSpecies() { return species; }
    public void setSpecies(String species) { this.species = species; }

    public String getBreed() { return breed; }
    public void setBreed(String breed) { this.breed = breed; }

    public LocalDate getDob() { return dob; }
    public void setDob(LocalDate dob) { this.dob = dob; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public String getPhotoPath() { return photoPath; }
    public void setPhotoPath(String photoPath) { this.photoPath = photoPath; }

    public String getMicrochipId() { return microchipId; }
    public void setMicrochipId(String microchipId) { this.microchipId = microchipId; }

    public String getHealthStatus() { return healthStatus; }
    public void setHealthStatus(String healthStatus) { this.healthStatus = healthStatus; }

    public Long getOwnerId() { return ownerId; }
    public void setOwnerId(Long ownerId) { this.ownerId = ownerId; }
}
