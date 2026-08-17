package com.example.petcare.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    /**
     * Core HTML email sender (no attachment)
     */
    public void sendHtmlEmail(String to, String subject, String htmlBody) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper =
                    new MimeMessageHelper(message, false, "UTF-8");

            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            helper.setFrom("Smart Pet Care <smartpetcare@gmail.com>");

            mailSender.send(message);
            System.out.println("📧 HTML email sent to: " + to);

        } catch (MessagingException e) {
            e.printStackTrace();
        }
    }

    /**
     * HTML email with attachment (PDF, etc.)
     */
    public void sendHtmlEmailWithAttachment(
            String to,
            String subject,
            String htmlBody,
            byte[] attachment,
            String fileName
    ) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper =
                    new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            helper.setFrom("Smart Pet Care <smartpetcare@gmail.com>");

            helper.addAttachment(fileName,
                    () -> new java.io.ByteArrayInputStream(attachment));

            mailSender.send(message);
            System.out.println("📧 HTML email with attachment sent to: " + to);

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
