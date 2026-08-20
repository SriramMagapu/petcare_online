package com.example.petcare.scheduler;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

/**
 * Keep-alive scheduler to prevent Render free tier from spinning down.
 * Pings the backend's own health endpoint every 10 minutes.
 * Set RENDER_EXTERNAL_URL env var on Render (it's auto-provided by Render).
 */
@Component
public class KeepAliveScheduler {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${RENDER_EXTERNAL_URL:}")
    private String renderUrl;

    // Every 10 minutes
    @Scheduled(fixedDelay = 10 * 60 * 1000, initialDelay = 2 * 60 * 1000)
    public void keepAlive() {
        if (renderUrl == null || renderUrl.isBlank()) {
            // Not running on Render — skip
            return;
        }
        try {
            String pingUrl = renderUrl + "/health";
            restTemplate.getForObject(pingUrl, String.class);
            System.out.println("✅ Keep-alive ping sent to: " + pingUrl);
        } catch (Exception e) {
            // Non-fatal — just log it
            System.out.println("⚠️ Keep-alive ping failed: " + e.getMessage());
        }
    }
}
