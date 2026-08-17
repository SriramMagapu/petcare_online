package com.example.petcare.scheduler;

import com.example.petcare.entity.Appointment;
import com.example.petcare.entity.VetProfile;
import com.example.petcare.repository.AppointmentRepository;
import com.example.petcare.repository.UserRepository;
import com.example.petcare.repository.VetProfileRepository;
import com.example.petcare.service.AppointmentEmailService;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class AppointmentReminderScheduler {

    private final AppointmentRepository appointmentRepository;
    private final AppointmentEmailService emailService;
    private final UserRepository userRepository;
    private final VetProfileRepository vetProfileRepository;

    public AppointmentReminderScheduler(
            AppointmentRepository appointmentRepository,
            AppointmentEmailService emailService,
            UserRepository userRepository,
            VetProfileRepository vetProfileRepository
    ) {
        this.appointmentRepository = appointmentRepository;
        this.emailService = emailService;
        this.userRepository = userRepository;
        this.vetProfileRepository = vetProfileRepository;
    }

    @Scheduled(fixedRate = 300000) // every 5 minutes
    public void sendReminders() {

        System.out.println("⏰ Reminder scheduler running...");

        List<Appointment> list =
                appointmentRepository.findByStatusAndReminderSentFalse("APPROVED");

        for (Appointment a : list) {

            try {
                LocalDateTime apptTime = a.getAppointmentDateTime();

                // 🔒 Null safety (for old records)
                if (apptTime == null) {
                    System.err.println(
                        "⚠️ appointmentDateTime is NULL for appointment ID: " + a.getId()
                    );
                    continue;
                }

                LocalDateTime now = LocalDateTime.now();

                // ⏰ 1-hour reminder window
                if (now.isAfter(apptTime.minusHours(1)) && now.isBefore(apptTime)) {

                    // OWNER EMAIL
                    String ownerEmail =
                            userRepository.findById(a.getOwnerId())
                                    .orElseThrow(() -> new RuntimeException("Owner user not found"))
                                    .getEmail();

                    // VET EMAIL (Profile → User)
                    VetProfile vet =
                            vetProfileRepository.findById(a.getVetId())
                                    .orElseThrow(() -> new RuntimeException("Vet profile not found"));

                    String vetEmail =
                            userRepository.findById(vet.getUserId())
                                    .orElseThrow(() -> new RuntimeException("Vet user not found"))
                                    .getEmail();

                    // 📧 SEND REMINDERS
                    emailService.sendReminder(ownerEmail, a, a.getMeetingLink());
                    emailService.sendReminder(vetEmail, a, a.getMeetingLink());

                    // ✅ Mark as sent
                    a.setReminderSent(true);
                    appointmentRepository.save(a);

                    System.out.println("✅ Reminder sent for appointment ID: " + a.getId());
                }

            } catch (Exception e) {
                System.err.println(
                        "❌ Failed to send reminder for appointment ID "
                                + a.getId() + " → " + e.getMessage()
                );
            }
        }
    }
}
