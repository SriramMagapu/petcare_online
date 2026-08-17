package com.example.petcare.dto;

import com.example.petcare.entity.Pet;
import com.example.petcare.entity.VetProfile;
import java.util.List;

public class AdminUserOverviewDTO {

    public Long id;
    public String name;        
    public String email;
    public String role;
    public String createdAt;

    // Optional
    public List<Pet> pets;
    public VetProfile vetProfile;
}
