package com.example.petcare.dto;

public class AdminVetDTO {

    private Long userId;
    private Long vetProfileId;
    private String email;
    private String name;
    private String specialization;
    private boolean approved;
    private String certificatePath;

    // getters & setters
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public Long getVetProfileId() { return vetProfileId; }
    public void setVetProfileId(Long vetProfileId) { this.vetProfileId = vetProfileId; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getSpecialization() { return specialization; }
    public void setSpecialization(String specialization) { this.specialization = specialization; }

    public boolean isApproved() { return approved; }
    public void setApproved(boolean approved) { this.approved = approved; }

    public String getCertificatePath() { return certificatePath; }
    public void setCertificatePath(String certificatePath) { this.certificatePath = certificatePath; }
}
