package com.example.petcare.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "vet_profiles")
public class VetProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    private String name;
    private String clinicName;
    private String specialization;
    private String phone;
    private String clinicAddress;

    private String photoPath;
    
    private String certificatePath;
    

    // ⭐ ADMIN CONTROL FIELD
    @Column(nullable = false)
    private boolean approved = false;

    private Instant createdAt = Instant.now();

    public VetProfile() {}

    // ===== getters / setters =====

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getClinicName() { return clinicName; }
    public void setClinicName(String clinicName) { this.clinicName = clinicName; }

    public String getSpecialization() { return specialization; }
    public void setSpecialization(String specialization) { this.specialization = specialization; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getClinicAddress() { return clinicAddress; }
    public void setClinicAddress(String clinicAddress) { this.clinicAddress = clinicAddress; }

    public String getPhotoPath() { return photoPath; }
    public void setPhotoPath(String photoPath) { this.photoPath = photoPath; }

    public boolean isApproved() { return approved; }
    public void setApproved(boolean approved) { this.approved = approved;}

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    
    public String getCertificatePath() { return certificatePath;}

    public void setCertificatePath(String certificatePath) { this.certificatePath = certificatePath; }
}
