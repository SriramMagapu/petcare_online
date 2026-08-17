package com.example.petcare.service;

import com.example.petcare.dto.AppointmentResponse;
import java.time.LocalTime;

import com.example.petcare.dto.VetAppointmentResponse;
import com.example.petcare.entity.*;
import com.example.petcare.enums.VisitType;
import com.example.petcare.exception.SlotUnavailableException;
import com.example.petcare.repository.*;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class AppointmentService {

    private final HealthRecordRepository healthRecordRepository;

    private final MeetingLinkService meetingLinkService;
    private final AppointmentEmailService appointmentEmailService;
    private final MedicalRecordRepository medicalRecordRepository;
    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;
    private final PetRepository petRepository;
    private final VetProfileRepository vetProfileRepository;
    private final OwnerProfileRepository ownerProfileRepository;

    public AppointmentService(
            MeetingLinkService meetingLinkService,
            AppointmentEmailService appointmentEmailService,
            MedicalRecordRepository medicalRecordRepository,
            AppointmentRepository appointmentRepository,
            UserRepository userRepository,
            PetRepository petRepository,
            VetProfileRepository vetProfileRepository,
            OwnerProfileRepository ownerProfileRepository
    , HealthRecordRepository healthRecordRepository) {
        this.meetingLinkService = meetingLinkService;
        this.appointmentEmailService = appointmentEmailService;
        this.medicalRecordRepository = medicalRecordRepository;
        this.appointmentRepository = appointmentRepository;
        this.userRepository = userRepository;
        this.petRepository = petRepository;
        this.vetProfileRepository = vetProfileRepository;
        this.ownerProfileRepository = ownerProfileRepository;
        this.healthRecordRepository = healthRecordRepository;
    }

    // OWNER → CREATE
    public AppointmentResponse createAppointment(Appointment a, String ownerEmail) {

        User ownerUser = userRepository.findByEmail(ownerEmail).orElseThrow();
        OwnerProfile owner = ownerProfileRepository.findByUserId(ownerUser.getId()).orElseThrow();
        VetProfile vet = vetProfileRepository.findById(a.getVetId()).orElseThrow();
        Pet pet = petRepository.findById(a.getPetId()).orElseThrow();
        
        if (a.getVisitType() == null) {
            a.setVisitType(VisitType.ONLINE);
        }


        if (!pet.getOwnerId().equals(owner.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        boolean taken = appointmentRepository
                .existsByVetIdAndAppointmentDateAndSlot(
                        vet.getId(), a.getAppointmentDate(), a.getSlot());

        if (taken) throw new SlotUnavailableException("Slot unavailable");

        a.setOwnerId(owner.getId());
        a.setVetId(vet.getId());
        a.setStatus("REQUESTED");
        
     // 🔹 Derive exact appointment time from slot
        LocalTime slotTime = switch (a.getSlot()) {
            case MORNING -> LocalTime.of(9, 0);
            case AFTERNOON -> LocalTime.of(14, 0);
            case EVENING -> LocalTime.of(18, 0);
        };

        // 🔹 Set exact datetime (CRITICAL for scheduler)
        a.setAppointmentDateTime(
            a.getAppointmentDate().atTime(slotTime)
        );
        

        Appointment saved = appointmentRepository.save(a);

        // 📩 Mail → Vet
        appointmentEmailService.notifyVetNewAppointment(vet, owner, pet, saved);

        return map(saved, vet);
    }

    // OWNER → VIEW
    public List<AppointmentResponse> getAppointmentsForPet(Long petId, String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        OwnerProfile owner = ownerProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Owner profile not found"));

        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new RuntimeException("Pet not found"));

       
        if (!pet.getOwnerId().equals(owner.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        return appointmentRepository.findByPetId(petId)
                .stream()
                .map(a -> map(
                        a,
                        vetProfileRepository.findById(a.getVetId()).orElse(null)
                ))
                .toList();
    }


    // VET → VIEW
    public List<VetAppointmentResponse> getVetAppointments(String vetEmail, String status) {

        User vetUser = userRepository.findByEmail(vetEmail).orElseThrow();
        VetProfile vet = vetProfileRepository.findByUserId(vetUser.getId()).orElseThrow();

        return appointmentRepository.findByVetIdAndStatus(vet.getId(), status)
                .stream()
                .map(this::mapVet)
                .toList();
    }

    // VET → REJECT
    public Appointment rejectAppointment(Long id) {
        Appointment appt = appointmentRepository.findById(id).orElseThrow();
        appt.setStatus("REJECTED");
        return appointmentRepository.save(appt);
    }

    // VET → APPROVE
 // VET → APPROVE
    public Appointment approveAppointment(Long id) {

        Appointment appt = appointmentRepository.findById(id).orElseThrow();

        if (!"REQUESTED".equals(appt.getStatus())) {
            throw new RuntimeException("Only REQUESTED can be approved");
        }

        VetProfile vet = vetProfileRepository.findById(appt.getVetId()).orElseThrow();
        OwnerProfile owner = ownerProfileRepository.findById(appt.getOwnerId()).orElseThrow();
        Pet pet = petRepository.findById(appt.getPetId()).orElseThrow();

        if (appt.getVisitType() == VisitType.ONLINE) {
            // generate meet link for telehealth
            appt.setMeetingLink(meetingLinkService.generateMeetLink(id));
            appt.setStatus("APPROVED");

            Appointment saved = appointmentRepository.save(appt);

            // send ONLINE acceptance mail
            appointmentEmailService.notifyOwnerAppointmentAcceptedOnline(owner, vet, pet, saved);
            return saved;
        }

        if (appt.getVisitType() == VisitType.ONSITE) {
            appt.setMeetingLink(null); // no video link for onsite
            appt.setStatus("APPROVED");

            Appointment saved = appointmentRepository.save(appt);

            // send ONSITE acceptance mail
            appointmentEmailService.notifyOwnerAppointmentAcceptedOnsite(owner, vet, pet, saved);
            return saved;
        }

        throw new RuntimeException("Invalid visit type");
    }


    // VET → COMPLETE
    public void completeAppointment(Long id, String vetName) {

        Appointment appt = appointmentRepository.findById(id).orElseThrow();

        if (!"APPROVED".equals(appt.getStatus())) {
            throw new RuntimeException("Only APPROVED can be completed");
        }

        if (appt.getVetNotes() == null || appt.getVetNotes().isBlank()) {
            throw new RuntimeException("Add notes first");
        }

        MedicalRecord record = new MedicalRecord();
        record.setPetId(appt.getPetId());
        record.setDiagnosis("Vet Consultation");
        record.setTreatment(appt.getVetNotes());
        record.setNotes(appt.getVetNotes());
        record.setVetName(vetName);

        medicalRecordRepository.save(record);

        appt.setStatus("COMPLETED");
        appointmentRepository.save(appt);
    }

    // NOTES
    public void saveVetNotes(Long id, String note) {
        Appointment appt = appointmentRepository.findById(id).orElseThrow();
        appt.setVetNotes(note);
        appointmentRepository.save(appt);
    }

    // SLOTS
    public List<String> getBookedSlots(Long vetId, String date) {

        LocalDate localDate = LocalDate.parse(date.trim());

        List<Appointment> list =
                appointmentRepository.findByVetIdAndAppointmentDateAndStatusIn(
                        vetId,
                        localDate,
                        List.of("REQUESTED", "APPROVED")
                );

        return list.stream()
                .map(a -> a.getSlot().name()) // MORNING, AFTERNOON
                .toList();
    }


    /* ---------- MAPPERS ---------- */

    private AppointmentResponse map(Appointment a, VetProfile vet) {
        AppointmentResponse r = new AppointmentResponse();

        r.setId(a.getId());
        r.setAppointmentDate(a.getAppointmentDate());
        r.setSlot(a.getSlot());
        r.setStatus(a.getStatus());
        r.setVetNotes(a.getVetNotes());
        r.setMeetingLink(a.getMeetingLink());

        if (a.getVisitType() != null) {
            r.setVisitType(a.getVisitType().name()); // ONLINE | ONSITE
        }

        if (vet != null) {
            r.setVetId(vet.getId());
            r.setVetName(vet.getName());
            r.setSpecialization(vet.getSpecialization());

            r.setClinicAddress(vet.getClinicAddress());
            r.setVetPhone(vet.getPhone());
        }

        return r;
    }

    private VetAppointmentResponse mapVet(Appointment a) {

        VetAppointmentResponse r = new VetAppointmentResponse();
        r.setId(a.getId());
        r.setAppointmentDate(a.getAppointmentDate());
        r.setSlot(a.getSlot());
        r.setStatus(a.getStatus());
        r.setMeetingLink(a.getMeetingLink());



        Pet pet = petRepository.findById(a.getPetId()).orElse(null);
        OwnerProfile owner = ownerProfileRepository.findById(a.getOwnerId()).orElse(null);

        if (pet != null) {
            r.setPetId(pet.getId());
            r.setPetName(pet.getName());
            r.setPetSpecies(pet.getSpecies());
            r.setPetHealthStatus(pet.getHealthStatus());
            
        }

        if (owner != null) {
            r.setOwnerId(owner.getId());
            r.setOwnerName(owner.getName());
        }

        return r;
    }
    
    public void cancelAppointment(Long id, String ownerEmail) {
        Appointment appt = appointmentRepository.findById(id).orElseThrow();

        User ownerUser = userRepository.findByEmail(ownerEmail).orElseThrow();
        OwnerProfile owner = ownerProfileRepository.findByUserId(ownerUser.getId()).orElseThrow();

        if (!appt.getOwnerId().equals(owner.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        if (!"REQUESTED".equals(appt.getStatus())) {
            throw new RuntimeException("Only REQUESTED appointments can be canceled");
        }

        appointmentRepository.delete(appt);
    }

    
    

}
