package com.example.petcare.dto;

import com.example.petcare.enums.Slot;
import java.time.LocalDate;

public class AppointmentResponse {

    private Long id;
    private LocalDate appointmentDate;
    private Slot slot;
    private String status;

    private Long vetId;
    private String vetName;
    private String specialization;

    private String vetNotes;
    private String meetingLink;

    // NEW
    private String visitType;       // "ONLINE" or "ONSITE"
    private String clinicAddress;  // for ONSITE
    private String vetPhone;       // for ONSITE

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

    public Long getVetId() { return vetId; }
    public void setVetId(Long vetId) { this.vetId = vetId; }

    public String getVetName() { return vetName; }
    public void setVetName(String vetName) { this.vetName = vetName; }

    public String getSpecialization() { return specialization; }
    public void setSpecialization(String specialization) {
        this.specialization = specialization;
    }

    public String getVetNotes() { return vetNotes; }
    public void setVetNotes(String vetNotes) { this.vetNotes = vetNotes; }

    public String getMeetingLink() { return meetingLink; }
    public void setMeetingLink(String meetingLink) { this.meetingLink = meetingLink; }

    public String getVisitType() { return visitType; }
    public void setVisitType(String visitType) { this.visitType = visitType; }

    public String getClinicAddress() { return clinicAddress; }
    public void setClinicAddress(String clinicAddress) { this.clinicAddress = clinicAddress; }

    public String getVetPhone() { return vetPhone; }
    public void setVetPhone(String vetPhone) { this.vetPhone = vetPhone; }
}
