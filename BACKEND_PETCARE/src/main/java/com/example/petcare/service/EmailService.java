package com.example.petcare.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

/**
 * Email service using Resend HTTP API (https://resend.com).
 * Replaces JavaMailSender / SMTP which is blocked on Render's free tier.
 * Free tier: 100 emails/day — sufficient for OTP flows.
 */
@Service
public class EmailService {

    private static final String RESEND_API_URL = "https://api.resend.com/emails";

    @Value("${resend.api.key:}")
    private String resendApiKey;

    @Value("${resend.from.address:Smart Pet Care <onboarding@resend.dev>}")
    private String fromAddress;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Send an HTML email via Resend HTTP API.
     */
    public void sendHtmlEmail(String to, String subject, String htmlBody) {
        if (resendApiKey == null || resendApiKey.isBlank()) {
            System.err.println("⚠️  RESEND_API_KEY is not configured — email not sent to: " + to);
            return;
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(resendApiKey);

            Map<String, Object> payload = Map.of(
                    "from",    fromAddress,
                    "to",      List.of(to),
                    "subject", subject,
                    "html",    htmlBody
            );

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);

            ResponseEntity<String> response =
                    restTemplate.postForEntity(RESEND_API_URL, request, String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                System.out.println("📧 Email sent via Resend to: " + to);
            } else {
                System.err.println("❌ Resend API error: " + response.getStatusCode() + " — " + response.getBody());
            }

        } catch (Exception e) {
            System.err.println("❌ Failed to send email to " + to + ": " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Send HTML email with attachment — falls back to plain send (Resend supports
     * attachments via base64, but this keeps the interface compatible).
     */
    public void sendHtmlEmailWithAttachment(
            String to,
            String subject,
            String htmlBody,
            byte[] attachment,
            String fileName
    ) {
        if (resendApiKey == null || resendApiKey.isBlank()) {
            System.err.println("⚠️  RESEND_API_KEY is not configured — email not sent to: " + to);
            return;
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(resendApiKey);

            // Resend supports attachments as base64
            Map<String, Object> attachmentMap = Map.of(
                    "filename", fileName,
                    "content",  java.util.Base64.getEncoder().encodeToString(attachment)
            );

            Map<String, Object> payload = Map.of(
                    "from",        fromAddress,
                    "to",          List.of(to),
                    "subject",     subject,
                    "html",        htmlBody,
                    "attachments", List.of(attachmentMap)
            );

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);

            ResponseEntity<String> response =
                    restTemplate.postForEntity(RESEND_API_URL, request, String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                System.out.println("📧 Email with attachment sent via Resend to: " + to);
            } else {
                System.err.println("❌ Resend API error: " + response.getStatusCode() + " — " + response.getBody());
            }

        } catch (Exception e) {
            System.err.println("❌ Failed to send email with attachment to " + to + ": " + e.getMessage());
            e.printStackTrace();
        }
    }
}
