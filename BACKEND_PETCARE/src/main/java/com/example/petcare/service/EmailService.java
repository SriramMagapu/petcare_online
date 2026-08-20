package com.example.petcare.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

/**
 * Email service using Resend HTTP API.
 * Sends emails directly to the recipient email address provided.
 */
@Service
public class EmailService {

    private static final String RESEND_API_URL = "https://api.resend.com/emails";

    @Value("${resend.api.key:}")
    private String resendApiKey;

    @Value("${resend.from.address:Smart Pet Care <onboarding@resend.dev>}")
    private String fromAddress;

    private final RestTemplate restTemplate = new RestTemplate();

    public void sendHtmlEmail(String to, String subject, String htmlBody) {
        sendViaResend(to, subject, htmlBody, null, null);
    }

    public void sendHtmlEmailWithAttachment(
            String to,
            String subject,
            String htmlBody,
            byte[] attachment,
            String fileName
    ) {
        sendViaResend(to, subject, htmlBody, attachment, fileName);
    }

    private void sendViaResend(String to, String subject, String htmlBody, byte[] attachment, String fileName) {
        if (resendApiKey == null || resendApiKey.isBlank()) {
            System.err.println("⚠️ RESEND_API_KEY is not configured — email not sent to: " + to);
            return;
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(resendApiKey);

            String targetEmail = (to != null) ? to.trim().toLowerCase() : "";

            Map<String, Object> payload = new java.util.HashMap<>();
            payload.put("from", fromAddress);
            payload.put("to", List.of(targetEmail));
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
                System.out.println("📧 Email sent via Resend directly to: " + targetEmail);
            } else {
                System.err.println("❌ Resend API error for " + targetEmail + ": " + response.getStatusCode() + " — " + response.getBody());
            }
        } catch (Exception e) {
            System.err.println("❌ Failed to send email via Resend to " + to + ": " + e.getMessage());
            e.printStackTrace();
        }
    }
}
