package com.example.petcare.dto;

import java.util.List;

public class AdminOverviewResponse {

    private List<AdminOwnerDTO> owners;
    private List<AdminVetDTO> vets;

    public List<AdminOwnerDTO> getOwners() { return owners; }
    public void setOwners(List<AdminOwnerDTO> owners) { this.owners = owners; }

    public List<AdminVetDTO> getVets() { return vets; }
    public void setVets(List<AdminVetDTO> vets) { this.vets = vets; }
}
