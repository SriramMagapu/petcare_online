package com.example.petcare.entity;

import com.example.petcare.enums.Slot;
import com.example.petcare.enums.VisitType;

import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "appointments",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {
            "vet_id", "appointment_date", "slot"
        })
    }
)
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long petId;
    private Long ownerId;
    private Long vetId;

    private LocalDate appointmentDate;

    @Enumerated(EnumType.STRING)
    private Slot slot;

    //exact appointment time
    private LocalDateTime appointmentDateTime;

    private String status; // REQUESTED / APPROVED / COMPLETED / REJECTED

    @Column(columnDefinition = "TEXT")
    private String vetNotes;

    private String meetingLink;
    
    @Enumerated(EnumType.STRING)
    private VisitType visitType;


    @Column(nullable = false)
    private Boolean reminderSent = false;

    private LocalDateTime createdAt = LocalDateTime.now();

    /* ---------- GETTERS ---------- */

    public Long getId() { return id; }
    public Long getPetId() { return petId; }
    public Long getOwnerId() { return ownerId; }
    public Long getVetId() { return vetId; }
    public LocalDate getAppointmentDate() { return appointmentDate; }
    public Slot getSlot() { return slot; }
    public LocalDateTime getAppointmentDateTime() { return appointmentDateTime; }
    public String getStatus() { return status; }
    public String getVetNotes() { return vetNotes; }
    public String getMeetingLink() { return meetingLink; }
    public Boolean isReminderSent() { return reminderSent; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public VisitType getVisitType() { return visitType;  }


    /* ---------- SETTERS ---------- */

    public void setId(Long id) { this.id = id; }
    public void setPetId(Long petId) { this.petId = petId; }
    public void setOwnerId(Long ownerId) { this.ownerId = ownerId; }
    public void setVetId(Long vetId) { this.vetId = vetId; }
    public void setAppointmentDate(LocalDate appointmentDate) { this.appointmentDate = appointmentDate; }
    public void setSlot(Slot slot) { this.slot = slot; }
    public void setAppointmentDateTime(LocalDateTime appointmentDateTime) {
        this.appointmentDateTime = appointmentDateTime;
    }
    public void setStatus(String status) { this.status = status; }
    public void setVetNotes(String vetNotes) { this.vetNotes = vetNotes; }
    public void setMeetingLink(String meetingLink) { this.meetingLink = meetingLink; }
    public void setReminderSent(Boolean reminderSent) { this.reminderSent = reminderSent; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public void setVisitType(VisitType visitType) {  this.visitType = visitType; }
}
