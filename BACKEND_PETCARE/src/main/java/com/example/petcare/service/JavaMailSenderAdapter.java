package com.example.petcare.service;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;

@Component
public class JavaMailSenderAdapter {
    private final JavaMailSender mailSender;

    public JavaMailSenderAdapter(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendSimple(String to, String subject, String body) {
        SimpleMailMessage m = new SimpleMailMessage();
        m.setTo(to);
        m.setSubject(subject);
        m.setText(body);
        mailSender.send(m);
    }
}
