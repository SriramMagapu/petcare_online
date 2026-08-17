package com.example.petcare.service;

import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class MeetingLinkService {

    public String generateMeetLink(Long appointmentId) {
        return "https://meet.google.com/"
                + UUID.randomUUID().toString().substring(0, 3) + "-"
                + UUID.randomUUID().toString().substring(0, 4) + "-"
                + appointmentId;
    }
}
