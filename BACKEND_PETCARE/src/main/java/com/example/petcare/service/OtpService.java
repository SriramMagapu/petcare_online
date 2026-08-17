package com.example.petcare.service;

import org.springframework.beans.factory.DisposableBean;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

@Service
public class OtpService implements DisposableBean {

    private static final int OTP_LENGTH = 6;
    private static final long OTP_TTL_SECONDS = 300; // 5 minutes
    private static final long CLEANUP_INTERVAL_SECONDS = 60;
    private static final int MAX_OTPS_PER_HOUR = 5;

    private final EmailService emailService;

    private final ConcurrentMap<String, OtpEntry> otpStore = new ConcurrentHashMap<>();
    private final ConcurrentMap<String, AttemptWindow> attempts = new ConcurrentHashMap<>();
    private final ScheduledExecutorService cleaner = Executors.newSingleThreadScheduledExecutor();
    private final Random random = new Random();

    public OtpService(EmailService emailService) {
        this.emailService = emailService;
        cleaner.scheduleAtFixedRate(
                this::cleanup,
                CLEANUP_INTERVAL_SECONDS,
                CLEANUP_INTERVAL_SECONDS,
                TimeUnit.SECONDS
        );
    }

    @Override
    public void destroy() {
        cleaner.shutdownNow();
    }

    /* =====================================================
       OTP GENERATION & EMAIL
       ===================================================== */

    public void generateAndSendOtp(String email) {
        if (email == null) return;

        email = email.trim().toLowerCase();
        if (email.isEmpty()) return;

        AttemptWindow window = attempts.computeIfAbsent(
                email,
                k -> new AttemptWindow(Instant.now().getEpochSecond())
        );

        if (!window.allow()) {
            // Rate limit exceeded – silent fail for security
            return;
        }

        String otp = generateOtp();
        long expiresAt = Instant.now().getEpochSecond() + OTP_TTL_SECONDS;
        otpStore.put(email, new OtpEntry(otp, expiresAt));

        // ⚠️ DEV ONLY – REMOVE IN PRODUCTION
        System.out.println("Generated OTP for " + email + " = " + otp);

        String htmlBody = buildOtpEmailHtml(otp);

        emailService.sendHtmlEmail(
                email,
                "🔐 Your OTP Code - Smart Pet Care",
                htmlBody
        );
    }

    /* =====================================================
       OTP VALIDATION
       ===================================================== */

    public boolean validateOtp(String email, String otp) {
        if (email == null || otp == null) return false;

        email = email.trim().toLowerCase();
        if (email.isEmpty()) return false;

        OtpEntry entry = otpStore.get(email);
        if (entry == null) return false;

        long now = Instant.now().getEpochSecond();
        if (now > entry.expiresAt) {
            otpStore.remove(email);
            return false;
        }

        if (!entry.otp.equals(otp.trim())) {
            return false;
        }

        otpStore.remove(email);
        return true;
    }

    public void evictOtp(String email) {
        if (email == null) return;
        otpStore.remove(email.trim().toLowerCase());
    }

    /* =====================================================
       INTERNAL HELPERS
       ===================================================== */

    private String generateOtp() {
        int min = (int) Math.pow(10, OTP_LENGTH - 1);
        int max = (int) Math.pow(10, OTP_LENGTH) - 1;
        return String.valueOf(random.nextInt(max - min + 1) + min);
    }

    private void cleanup() {
        long now = Instant.now().getEpochSecond();

        otpStore.entrySet().removeIf(
                e -> e.getValue() != null && e.getValue().expiresAt < now
        );

        attempts.entrySet().removeIf(
                e -> e.getValue() != null && e.getValue().isStale(now)
        );
    }

    private String buildOtpEmailHtml(String otp) {
        return """
<!DOCTYPE html>
<html>
<body style="margin:0; padding:0; background:#f4f6f8; font-family:Arial, sans-serif;">
<table width="100%%" cellpadding="0" cellspacing="0">
<tr>
<td align="center" style="padding:30px;">

<table width="520" style="background:#ffffff; border-radius:10px;
box-shadow:0 6px 20px rgba(0,0,0,0.08); overflow:hidden;">

<tr>
<td style="background:#2196f3; padding:20px; text-align:center;
color:#ffffff; font-size:22px; font-weight:bold;">
🐾 Smart Pet Care
</td>
</tr>

<tr>
<td style="padding:30px; color:#333;">
<h2 style="margin-top:0;">Your OTP Code</h2>

<p>Use the OTP below to verify your account:</p>

<div style="font-size:32px; font-weight:bold; letter-spacing:6px;
text-align:center; padding:15px; margin:20px 0;
background:#f1f5f9; border-radius:8px;">
%s
</div>

<p style="color:#555;">
⏰ This OTP will expire in <b>5 minutes</b>.
</p>

<p style="color:#888; font-size:13px;">
If you did not request this OTP, please ignore this email.
</p>
</td>
</tr>

<tr>
<td style="background:#f1f5f9; text-align:center;
padding:15px; font-size:12px; color:#777;">
© 2026 Smart Pet Care • Secure Access
</td>
</tr>

</table>

</td>
</tr>
</table>
</body>
</html>
""".formatted(otp);
    }

    /* =====================================================
       INTERNAL CLASSES
       ===================================================== */

    private static class OtpEntry {
        final String otp;
        final long expiresAt;

        OtpEntry(String otp, long expiresAt) {
            this.otp = otp;
            this.expiresAt = expiresAt;
        }
    }

    private static class AttemptWindow {
        private int count;
        private long windowStartEpoch;

        private static final long WINDOW_SECONDS = 3600;
        private static final long STALE_SECONDS = 7200;

        AttemptWindow(long nowEpoch) {
            this.windowStartEpoch = nowEpoch;
            this.count = 0;
        }

        synchronized boolean allow() {
            long now = Instant.now().getEpochSecond();
            if (now - windowStartEpoch > WINDOW_SECONDS) {
                windowStartEpoch = now;
                count = 1;
                return true;
            }
            if (count >= MAX_OTPS_PER_HOUR) {
                return false;
            }
            count++;
            return true;
        }

        boolean isStale(long nowEpoch) {
            return nowEpoch - windowStartEpoch > STALE_SECONDS;
        }
    }
}
