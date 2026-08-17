package com.example.petcare;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@EnableScheduling
@SpringBootApplication
public class PetcareAuthApplication {

	public static void main(String[] args) {
		
		SpringApplication.run(PetcareAuthApplication.class, args);
	}
	@Bean
    CommandLineRunner generateAdminPassword() {
        return args -> {
            BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
            String hash = encoder.encode("admin123");
            System.out.println("ADMIN PASSWORD HASH:");
            System.out.println(hash);
        };
	}

}
