package com.example.petcare.controller;

import com.example.petcare.dto.AppointmentResponse;
import com.example.petcare.dto.VetAppointmentResponse;
import com.example.petcare.entity.*;
import com.example.petcare.repository.*;
import com.example.petcare.service.AppointmentService;
import com.example.petcare.service.PdfReportService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class AppointmentController {

    private final AppointmentService appointmentService;
    private final AppointmentRepository appointmentRepository;
    private final PetRepository petRepository;
    private final VetProfileRepository vetProfileRepository;
    private final UserRepository userRepository;
    private final OwnerProfileRepository ownerProfileRepository;
    private final PdfReportService pdfReportService;

    public AppointmentController(
            AppointmentService appointmentService,
            AppointmentRepository appointmentRepository,
            PetRepository petRepository,
            VetProfileRepository vetProfileRepository,
            UserRepository userRepository,
            OwnerProfileRepository ownerProfileRepository,
            PdfReportService pdfReportService
    ) {
        this.appointmentService = appointmentService;
        this.appointmentRepository = appointmentRepository;
        this.petRepository = petRepository;
        this.vetProfileRepository = vetProfileRepository;
        this.userRepository = userRepository;
        this.ownerProfileRepository = ownerProfileRepository;
        this.pdfReportService = pdfReportService;
    }

    // OWNER → CREATE APPOINTMENT
    @PostMapping("/appointments")
    public ResponseEntity<AppointmentResponse> create(
            @RequestBody Appointment appointment,
            Authentication auth) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(
                        appointmentService.createAppointment(
                                appointment,
                                auth.getName()
                        )
                );
    }

    // OWNER → VIEW PET APPOINTMENTS
    @GetMapping("/pets/{petId}/appointments")
    public ResponseEntity<List<AppointmentResponse>> list(
            @PathVariable Long petId,
            Authentication auth) {

        return ResponseEntity.ok(
                appointmentService.getAppointmentsForPet(
                        petId,
                        auth.getName()
                )
        );
    }

    // VET → VIEW THEIR APPOINTMENTS
    @GetMapping("/vet/appointments")
    public ResponseEntity<List<VetAppointmentResponse>> vetAppointments(
            @RequestParam String status,
            Authentication auth) {

        return ResponseEntity.ok(
                appointmentService.getVetAppointments(
                        auth.getName(),
                        status
                )
        );
    }
    
    @DeleteMapping("/appointments/{id}")
    public ResponseEntity<?> cancel(@PathVariable Long id, Authentication auth) {
        appointmentService.cancelAppointment(id, auth.getName());
        return ResponseEntity.ok().build();
    }


    @PutMapping("/appointments/{id}/reject")
    public ResponseEntity<Appointment> reject(@PathVariable Long id) {
        return ResponseEntity.ok(appointmentService.rejectAppointment(id));
    }

    @PutMapping("/appointments/{id}/approve")
    public ResponseEntity<Appointment> approve(@PathVariable Long id) {
        return ResponseEntity.ok(appointmentService.approveAppointment(id));
    }

    @GetMapping("/vet/{vetId}/slots")
    public ResponseEntity<List<String>> getBookedSlots(
            @PathVariable Long vetId,
            @RequestParam String date
    ) {
        return ResponseEntity.ok(appointmentService.getBookedSlots(vetId, date));
    }

    @PutMapping("/appointments/{id}/complete")
    public ResponseEntity<?> complete(@PathVariable Long id, Authentication auth) {
        appointmentService.completeAppointment(id, auth.getName());
        return ResponseEntity.ok().build();
    }

    @PutMapping("/appointments/{id}/notes")
    public ResponseEntity<?> addNotes(
            @PathVariable Long id,
            @RequestBody String note,
            Authentication auth
    ) {
        appointmentService.saveVetNotes(id, note);
        return ResponseEntity.ok().build();
    }

    // OWNER → DOWNLOAD REPORT
    @GetMapping("/appointments/{id}/report")
    public ResponseEntity<byte[]> downloadReport(
            @PathVariable Long id,
            Authentication auth
    ) throws Exception {

        Appointment appt = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        OwnerProfile owner = ownerProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Owner profile not found"));

        if (!appt.getOwnerId().equals(owner.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        Pet pet = petRepository.findById(appt.getPetId()).orElseThrow();
        VetProfile vet = vetProfileRepository.findById(appt.getVetId()).orElseThrow();

        byte[] pdfBytes = pdfReportService.generateAppointmentReport(appt, pet, vet);

        String filename = "AppointmentReport_" + pet.getName() + "_" + appt.getAppointmentDate() + ".pdf";

        return ResponseEntity.ok()
                .header("Content-Type", "application/pdf")
                .header("Content-Disposition", "attachment; filename=\"" + filename + "\"")
                .body(pdfBytes);
    }
    
    
}
