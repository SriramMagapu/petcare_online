package com.example.petcare.dto;

public class RegisterRequest {
    private String role;
    private String email;
    private String password;

    // owner fields
    private String ownerName;
    private String ownerPhone;
    private String ownerAddress;

    // vet fields
    private String vetName;
    private String clinicName;
    private String specialization;
    private String vetPhone;
    private String clinicAddress;

    public RegisterRequest() {}

    // getters & setters (generate or paste)
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getOwnerName() { return ownerName; }
    public void setOwnerName(String ownerName) { this.ownerName = ownerName; }

    public String getOwnerPhone() { return ownerPhone; }
    public void setOwnerPhone(String ownerPhone) { this.ownerPhone = ownerPhone; }

    public String getOwnerAddress() { return ownerAddress; }
    public void setOwnerAddress(String ownerAddress) { this.ownerAddress = ownerAddress; }

    public String getVetName() { return vetName; }
    public void setVetName(String vetName) { this.vetName = vetName; }

    public String getClinicName() { return clinicName; }
    public void setClinicName(String clinicName) { this.clinicName = clinicName; }

    public String getSpecialization() { return specialization; }
    public void setSpecialization(String specialization) { this.specialization = specialization; }

    public String getVetPhone() { return vetPhone; }
    public void setVetPhone(String vetPhone) { this.vetPhone = vetPhone; }

    public String getClinicAddress() { return clinicAddress; }
    public void setClinicAddress(String clinicAddress) { this.clinicAddress = clinicAddress; }
}
