package com.example.petcare.dto;

import com.example.petcare.entity.Pet;
import java.util.List;

public class AdminOwnerDTO {
    private Long userId;
    private String email;
    private int petCount;
    private List<Pet> pets;

    // getters & setters
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public int getPetCount() { return petCount; }
    public void setPetCount(int petCount) { this.petCount = petCount; }

    public List<Pet> getPets() { return pets; }
    public void setPets(List<Pet> pets) { this.pets = pets; }
}
