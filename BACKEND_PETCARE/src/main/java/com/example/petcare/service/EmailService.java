package com.example.petcare.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

/**
 * Email service using Resend HTTP API.
 * Route testing emails via Resend account owner email (2020aara@gmail.com)
 * so all test account OTPs are delivered cleanly without 403 errors.
 */
@Service
public class EmailService {

    private static final String RESEND_API_URL = "https://api.resend.com/emails";

    @Value("${resend.api.key:}")
    private String resendApiKey;

    @Value("${resend.from.address:Smart Pet Care <onboarding@resend.dev>}")
    private String fromAddress;

    private static final String OWNER_TEST_EMAIL = "2020aara@gmail.com";

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

            // On Resend free testing mode (onboarding@resend.dev), Resend restricts delivery
            // to the account owner email (2020aara@gmail.com).
            // We route all test account emails to 2020aara@gmail.com and tag the intended target in subject/body!
            String targetEmail = (to != null) ? to.trim().toLowerCase() : "";
            String actualRecipient = OWNER_TEST_EMAIL;
            String resendSubject = subject;

            if (!targetEmail.equalsIgnoreCase(OWNER_TEST_EMAIL) && !targetEmail.isEmpty()) {
                resendSubject = "🔐 [For: " + targetEmail + "] " + subject;
                htmlBody = "<div style='background:#fff3cd; padding:10px; border-radius:5px; margin-bottom:15px; color:#856404; font-family:sans-serif;'><b>Test Mode Notification:</b> This OTP was requested for account <b>" + targetEmail + "</b></div>" + htmlBody;
            }

            Map<String, Object> payload = new java.util.HashMap<>();
            payload.put("from", fromAddress);
            payload.put("to", List.of(actualRecipient));
            payload.put("subject", resendSubject);
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
                System.out.println("📧 OTP Email for [" + targetEmail + "] delivered via Resend to " + actualRecipient);
            } else {
                System.err.println("❌ Resend API error: " + response.getStatusCode() + " — " + response.getBody());
            }
        } catch (Exception e) {
            System.err.println("❌ Failed to send email via Resend for " + to + ": " + e.getMessage());
            e.printStackTrace();
        }
    }
}
