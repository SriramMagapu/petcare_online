package com.example.petcare.dto;

import com.example.petcare.enums.Slot;
import java.time.LocalDate;

public class VetAppointmentResponse {

    private Long id;
    private LocalDate appointmentDate;
    private Slot slot;
    private String status;

    private Long petId;
    private String petName;
    
    private String petHealthStatus;
    
    private String meetingLink;

    private String petSpecies;
    
    public String getPetHealthStatus() {
		return petHealthStatus;
	}
	public void setPetHealthStatus(String petHealthStatus) {
		this.petHealthStatus = petHealthStatus;
	}
	private Long ownerId;
    private String ownerName;

    // getters & setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public LocalDate getAppointmentDate() { return appointmentDate; }
    public void setAppointmentDate(LocalDate appointmentDate) {
        this.appointmentDate = appointmentDate;
    }

    public Slot getSlot() { return slot; }
    public void setSlot(Slot slot) { this.slot = slot; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Long getPetId() { return petId; }
    public void setPetId(Long petId) { this.petId = petId; }

    public String getPetName() { return petName; }
    public void setPetName(String petName) { this.petName = petName; }

    public Long getOwnerId() { return ownerId; }
    public void setOwnerId(Long ownerId) { this.ownerId = ownerId; }

    public String getOwnerName() { return ownerName; }
    public void setOwnerName(String ownerName) { this.ownerName = ownerName; }
    
    public String getMeetingLink() { return meetingLink; }
    public void setMeetingLink(String meetingLink) { this.meetingLink = meetingLink; }
    
    public String getPetSpecies() { return petSpecies; }
    public void setPetSpecies(String petSpecies) { this.petSpecies = petSpecies; }


}
