package com.example.petcare.repository;

import com.example.petcare.entity.Appointment;
import com.example.petcare.enums.Slot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    boolean existsByVetIdAndAppointmentDateAndSlot(
            Long vetId, LocalDate appointmentDate, Slot slot);

    List<Appointment> findByPetId(Long petId);

    List<Appointment> findByVetIdAndStatus(Long vetId, String status);

    List<Appointment> findByVetIdAndAppointmentDate(Long vetId, LocalDate date);
    
    List<Appointment> findByVetIdAndAppointmentDateAndStatusIn(
            Long vetId,
            LocalDate appointmentDate,
            List<String> status
    );

    // ⭐ REQUIRED FOR SCHEDULER
    List<Appointment> findByStatusAndReminderSentFalse(String status);

    // ⭐ REQUIRED FOR ADMIN REPORTS
    long countByStatus(String status);
}
