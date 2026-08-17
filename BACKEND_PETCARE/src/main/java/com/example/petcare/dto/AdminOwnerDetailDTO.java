package com.example.petcare.dto;

import com.example.petcare.entity.Pet;
import java.util.List;

public class AdminOwnerDetailDTO {

    private Long userId;          // ✅ clearer than generic id
    private String name;
    private String email;
    private String role;
    private String createdAt;
    private int petCount;         // ✅ useful for admin UI
    private List<Pet> pets;

    /* ===== Getters & Setters ===== */

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }

    public int getPetCount() {
        return petCount;
    }

    public void setPetCount(int petCount) {
        this.petCount = petCount;
    }

    public List<Pet> getPets() {
        return pets;
    }

    public void setPets(List<Pet> pets) {
        this.pets = pets;
    }
}
