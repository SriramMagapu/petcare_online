package com.example.petcare.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

/**
 * Dual Email service supporting Brevo API (primary - sends to ANY email)
 * and Resend API (fallback).
 * Both use HTTP REST API, bypassing Render's outbound SMTP port blocking.
 */
@Service
public class EmailService {

    private static final String BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";
    private static final String RESEND_API_URL = "https://api.resend.com/emails";

    @Value("${brevo.api.key:}")
    private String brevoApiKey;

    @Value("${brevo.sender.email:2020aara@gmail.com}")
    private String brevoSenderEmail;

    @Value("${resend.api.key:}")
    private String resendApiKey;

    @Value("${resend.from.address:Smart Pet Care <onboarding@resend.dev>}")
    private String fromAddress;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Send an HTML email via Brevo or Resend HTTP API.
     */
    public void sendHtmlEmail(String to, String subject, String htmlBody) {
        if (brevoApiKey != null && !brevoApiKey.isBlank()) {
            sendViaBrevo(to, subject, htmlBody, null, null);
            return;
        }

        if (resendApiKey != null && !resendApiKey.isBlank()) {
            sendViaResend(to, subject, htmlBody, null, null);
            return;
        }

        System.err.println("⚠️ Neither BREVO_API_KEY nor RESEND_API_KEY is configured — email not sent to: " + to);
    }

    /**
     * Send HTML email with attachment.
     */
    public void sendHtmlEmailWithAttachment(
            String to,
            String subject,
            String htmlBody,
            byte[] attachment,
            String fileName
    ) {
        if (brevoApiKey != null && !brevoApiKey.isBlank()) {
            sendViaBrevo(to, subject, htmlBody, attachment, fileName);
            return;
        }

        if (resendApiKey != null && !resendApiKey.isBlank()) {
            sendViaResend(to, subject, htmlBody, attachment, fileName);
            return;
        }

        System.err.println("⚠️ Neither BREVO_API_KEY nor RESEND_API_KEY is configured — email not sent to: " + to);
    }

    private void sendViaBrevo(String to, String subject, String htmlBody, byte[] attachment, String fileName) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("api-key", brevoApiKey);
            headers.set("accept", "application/json");

            Map<String, Object> senderMap = Map.of("name", "Smart Pet Care", "email", brevoSenderEmail);
            Map<String, Object> toMap = Map.of("email", to);

            Map<String, Object> payload = new java.util.HashMap<>();
            payload.put("sender", senderMap);
            payload.put("to", List.of(toMap));
            payload.put("subject", subject);
            payload.put("htmlContent", htmlBody);

            if (attachment != null && fileName != null) {
                Map<String, Object> attachmentMap = Map.of(
                        "name", fileName,
                        "content", java.util.Base64.getEncoder().encodeToString(attachment)
                );
                payload.put("attachment", List.of(attachmentMap));
            }

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(BREVO_API_URL, request, String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                System.out.println("📧 Email sent via Brevo to: " + to);
            } else {
                System.err.println("❌ Brevo API error: " + response.getStatusCode() + " — " + response.getBody());
            }
        } catch (Exception e) {
            System.err.println("❌ Failed to send email via Brevo to " + to + ": " + e.getMessage());
            e.printStackTrace();
        }
    }

    private void sendViaResend(String to, String subject, String htmlBody, byte[] attachment, String fileName) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(resendApiKey);

            Map<String, Object> payload = new java.util.HashMap<>();
            payload.put("from", fromAddress);
            payload.put("to", List.of(to));
            payload.put("subject", subject);
            payload.put("html", htmlBody);

            if (attachment != null && fileName != null) {
                Map<String, Object> attachmentMap = Map.of(
                        "filename", fileName,
                        "content", java.util.Base64.getEncoder().encodeToString(attachment)
                );
                payload.put("attachments", List.of(attachmentMap));
            }

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(RESEND_API_URL, request, String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                System.out.println("📧 Email sent via Resend to: " + to);
            } else {
                System.err.println("❌ Resend API error: " + response.getStatusCode() + " — " + response.getBody());
            }
        } catch (Exception e) {
            System.err.println("❌ Failed to send email via Resend to " + to + ": " + e.getMessage());
            e.printStackTrace();
        }
    }
}
