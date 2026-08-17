package com.example.petcare.service;

import com.example.petcare.entity.*;
import com.example.petcare.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class AppointmentEmailService {

    private final EmailService emailService;
    private final UserRepository userRepository;

    public AppointmentEmailService(
            EmailService emailService,
            UserRepository userRepository
    ) {
        this.emailService = emailService;
        this.userRepository = userRepository;
    }

    /* =====================================================
       OWNER → VET : NEW APPOINTMENT REQUEST
       ===================================================== */
    public void notifyVetNewAppointment(
            VetProfile vet, OwnerProfile owner, Pet pet, Appointment appt) {

        String vetEmail = userRepository.findById(vet.getUserId())
                .orElseThrow()
                .getEmail();

        emailService.sendHtmlEmail(
                vetEmail,
                "🐾 New Appointment Request",
                baseTemplate(
                        "New Appointment Request",
                        section("🐶 Pet", pet.getName()) +
                        section("👤 Owner", owner.getName()) +
                        appointmentSection(appt) +
                        infoBox("Please review this appointment in your dashboard.")
                )
        );
    }

    /* =====================================================
       VET → OWNER : ONLINE APPOINTMENT APPROVED (HIGHLIGHTED)
       ===================================================== */
    public void notifyOwnerAppointmentAcceptedOnline(
            OwnerProfile owner, VetProfile vet, Pet pet, Appointment appt) {

        emailService.sendHtmlEmail(
                owner.getEmail(),
                "🖥️ Online Appointment Approved",
                baseTemplate(
                        "Appointment Approved",
                        section("🐶 Pet", pet.getName()) +
                        section("👨‍⚕️ Veterinarian", "Dr. " + vet.getName()) +
                        appointmentSection(appt) +
                        onlineMeetingSection(appt.getMeetingLink()) +
                        noteBox("Please join 10 minutes early.")
                )
        );
    }

    /* =====================================================
       VET → OWNER : ONSITE APPOINTMENT APPROVED
       ===================================================== */
    public void notifyOwnerAppointmentAcceptedOnsite(
            OwnerProfile owner, VetProfile vet, Pet pet, Appointment appt) {

        emailService.sendHtmlEmail(
                owner.getEmail(),
                "🏥 Appointment Approved - Smart Pet Care",
                baseTemplate(
                        "Appointment Approved",
                        section("🐶 Pet", pet.getName()) +
                        section("👨‍⚕️ Veterinarian",
                                "Dr. " + vet.getName() + "<br>" + vet.getClinicName()) +
                        appointmentSection(appt) +
                        locationSection(vet) +
                        noteBox("Please arrive 10 minutes early for smooth check-in.")
                )
        );
    }

    /* =====================================================
       VET → OWNER : APPOINTMENT REJECTED
       ===================================================== */
    public void notifyOwnerAppointmentRejected(
            OwnerProfile owner,
            VetProfile vet,
            Pet pet,
            Appointment appt,
            String reason
    ) {
        emailService.sendHtmlEmail(
                owner.getEmail(),
                "❌ Appointment Update - Smart Pet Care",
                baseTemplate(
                        "Appointment Not Approved",
                        section("🐶 Pet", pet.getName()) +
                        section("👨‍⚕️ Veterinarian", "Dr. " + vet.getName()) +
                        appointmentSection(appt) +
                        (reason != null && !reason.isBlank()
                                ? warningBox("Reason", reason)
                                : "") +
                        infoBox("You may book another appointment by choosing a different date or slot.")
                )
        );
    }

    /* =====================================================
       REMINDER EMAIL
       ===================================================== */
    public void sendReminder(String email, Appointment appt, String meetLink) {

        emailService.sendHtmlEmail(
                email,
                "⏰ Appointment Reminder",
                baseTemplate(
                        "Appointment Reminder",
                        appointmentSection(appt) +
                        onlineMeetingSection(meetLink)
                )
        );
    }
    
    /* =====================================================
    VET → OWNER : APPOINTMENT COMPLETED (PDF ATTACHED)
    ===================================================== */
 public void notifyOwnerAppointmentCompleted(
         OwnerProfile owner,
         VetProfile vet,
         Pet pet,
         Appointment appt,
         byte[] medicalReportPdf
 ) {

     emailService.sendHtmlEmailWithAttachment(
             owner.getEmail(),
             "📄 Appointment Completed - Medical Report",
             appointmentCompletedTemplate(owner, vet, pet, appt),
             medicalReportPdf,
             "Pet_Medical_Report.pdf"
     );
 }


    /* =====================================================
       UI COMPONENT BUILDERS
       ===================================================== */

    private String section(String title, String value) {
        return """
        <div class="section">
          <b>%s</b>
          <p>%s</p>
        </div>
        """.formatted(title, value);
    }

    private String appointmentSection(Appointment appt) {
        return """
        <div class="section highlight">
          <b>📅 Appointment Details</b>
          <table width="100%%">
            <tr><td>Date</td><td align="right">%s</td></tr>
            <tr><td>Slot</td><td align="right">%s</td></tr>
          </table>
        </div>
        """.formatted(
                appt.getAppointmentDate(),
                appt.getSlot()
        );
    }

    private String locationSection(VetProfile vet) {
        return """
        <div class="section warn">
          <b>📍 Clinic Location</b>
          <p>
            %s<br>
            %s<br>
            📞 %s
          </p>
        </div>
        """.formatted(
                vet.getClinicName(),
                vet.getClinicAddress(),
                vet.getPhone()
        );
    }

    private String onlineMeetingSection(String meetingLink) {
        if (meetingLink == null || meetingLink.isBlank()) return "";

        return """
        <div class="meeting">
          <b>🖥️ Online Consultation Link</b>
          <p>Use the button below to join your appointment.</p>

          <a class="btn" href="%s">Join Online Session</a>

          <p class="small">
            If the button does not work, copy and paste this link:<br>
            <span class="link">%s</span>
          </p>
        </div>
        """.formatted(meetingLink, meetingLink);
    }

    private String infoBox(String text) {
        return """
        <div class="note">%s</div>
        """.formatted(text);
    }

    private String warningBox(String title, String text) {
        return """
        <div class="warn">
          <b>%s</b>
          <p>%s</p>
        </div>
        """.formatted(title, text);
    }

    private String noteBox(String text) {
        return """
        <div class="note">%s</div>
        """.formatted(text);
    }

    /* =====================================================
       BASE TEMPLATE
       ===================================================== */
    private String baseTemplate(String title, String content) {
        return """
<!DOCTYPE html>
<html>
<body style="margin:0; padding:0; background:#eef2f6; font-family:'Segoe UI', Arial, sans-serif;">
<table width="100%%" cellpadding="0" cellspacing="0">
<tr>
<td align="center" style="padding:30px 12px;">

<table width="620" style="background:#ffffff; border-radius:14px;
box-shadow:0 10px 28px rgba(0,0,0,0.12); overflow:hidden;">

<tr>
<td style="background:linear-gradient(135deg,#2196f3,#00bcd4);
padding:26px; text-align:center; color:#ffffff;">
<h1 style="margin:0;">🐾 Smart Pet Care</h1>
<p style="margin:6px 0 0; font-size:14px; opacity:0.9;">
Veterinary Care, Simplified
</p>
</td>
</tr>

<tr>
<td style="padding:28px; color:#333;">
<h2>%s</h2>
%s
</td>
</tr>

<tr>
<td style="background:#f4f6f8; text-align:center;
padding:16px; font-size:12px; color:#777;">
© 2026 Smart Pet Care • All rights reserved
</td>
</tr>

</table>

</td>
</tr>
</table>

<style>
.section {
  background:#f9fbfd;
  border-radius:12px;
  padding:16px;
  margin-bottom:14px;
}
.highlight {
  background:#f1f8ff;
}
.warn {
  background:#fff3e0;
  border-radius:12px;
  padding:16px;
  margin-bottom:14px;
}
.note {
  background:#e3f2fd;
  padding:14px;
  border-radius:10px;
  font-size:13px;
  margin-top:18px;
}
.meeting {
  background:#e8f5ff;
  border:2px dashed #2196f3;
  border-radius:12px;
  padding:18px;
  margin:20px 0;
  text-align:center;
}
.small {
  font-size:12px;
  color:#555;
  margin-top:10px;
}
.link {
  word-break:break-all;
  color:#1565c0;
}
.btn {
  display:inline-block;
  margin-top:14px;
  padding:12px 22px;
  background:#2196f3;
  color:#ffffff;
  text-decoration:none;
  border-radius:8px;
  font-weight:600;
}
</style>

</body>
</html>
""".formatted(title, content);
    }
    private String appointmentCompletedTemplate(
            OwnerProfile owner,
            VetProfile vet,
            Pet pet,
            Appointment appt
    ) {
        return """
    <!DOCTYPE html>
    <html>
    <body style="margin:0; padding:0; background:#eef2f6; font-family:'Segoe UI', Arial, sans-serif;">
    <table width="100%%" cellpadding="0" cellspacing="0">
    <tr>
    <td align="center" style="padding:30px 12px;">

    <table width="620" style="background:#ffffff; border-radius:14px;
    box-shadow:0 10px 28px rgba(0,0,0,0.12); overflow:hidden;">

    <!-- HEADER -->
    <tr>
    <td style="background:linear-gradient(135deg,#4caf50,#2e7d32);
    padding:26px; text-align:center; color:#ffffff;">
    <h1 style="margin:0;">🐾 Smart Pet Care</h1>
    <p style="margin:6px 0 0; font-size:14px; opacity:0.9;">
    Appointment Completed
    </p>
    </td>
    </tr>

    <!-- STATUS -->
    <tr>
    <td style="padding:18px; text-align:center;">
    <span style="background:#e8f5e9; color:#2e7d32;
    padding:8px 16px; border-radius:20px;
    font-weight:600; font-size:13px;">
    ✔ Appointment Successfully Completed
    </span>
    </td>
    </tr>

    <!-- CONTENT -->
    <tr>
    <td style="padding:0 26px 26px; color:#333;">

    <div class="section">
    <b>🐶 Pet</b>
    <p>%s</p>
    </div>

    <div class="section">
    <b>👨‍⚕️ Veterinarian</b>
    <p>Dr. %s<br>%s</p>
    </div>

    <div class="section highlight">
    <b>📅 Appointment Details</b>
    <table width="100%%">
    <tr><td>Date</td><td align="right">%s</td></tr>
    <tr><td>Slot</td><td align="right">%s</td></tr>
    </table>
    </div>

    <div class="note">
    📎 <b>Medical report is attached</b> to this email for your reference.
    </div>

    <p style="margin-top:18px;">
    Thank you for choosing <b>Smart Pet Care</b>.
    We wish your pet a speedy recovery 💙
    </p>

    </td>
    </tr>

    <!-- FOOTER -->
    <tr>
    <td style="background:#f4f6f8; text-align:center;
    padding:16px; font-size:12px; color:#777;">
    © 2026 Smart Pet Care • Health comes first
    </td>
    </tr>

    </table>

    </td>
    </tr>
    </table>

    <style>
    .section {
      background:#f9fbfd;
      border-radius:12px;
      padding:16px;
      margin-bottom:14px;
    }
    .highlight {
      background:#f1f8ff;
    }
    .note {
      background:#e3f2fd;
      padding:14px;
      border-radius:10px;
      font-size:13px;
      margin-top:18px;
    }
    </style>

    </body>
    </html>
    """.formatted(
                pet.getName(),
                vet.getName(),
                vet.getClinicName(),
                appt.getAppointmentDate(),
                appt.getSlot()
        );
    }

}
