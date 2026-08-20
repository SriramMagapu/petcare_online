package com.example.petcare.config;

import com.example.petcare.service.JwtService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtService jwtService;

    public SecurityConfig(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Bean
    public JwtFilter jwtFilter() {
        return new JwtFilter(jwtService);
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http
            .cors(cors -> {})
            .csrf(csrf -> csrf.disable())

            .sessionManagement(sm ->
                sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )

            .authorizeHttpRequests(auth -> auth

            	    /* ========== PREFLIGHT ========== */
            	    .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

            	    /* ========== HEALTH CHECK (keep-alive) ========== */
            	    .requestMatchers("/health").permitAll()

            	    /* ========== AUTH ========== */
            	    .requestMatchers("/auth/**", "/api/auth/**").permitAll()

            	    /* ========== PUBLIC FILE ACCESS (IMAGES) ========== */
            	    .requestMatchers("/uploads/**").permitAll()
            	    .requestMatchers("/uploads/products/**").permitAll()

            	    
            	    // ADMIN
            	    .requestMatchers("/api/admin/products/**").hasRole("ADMIN")

            	    // OWNER STORE
            	    .requestMatchers("/api/store/**").hasRole("OWNER")
            	    .requestMatchers("/products/**").permitAll()
            	    .requestMatchers("/api/cart/**").hasRole("OWNER")


            	    /* ========== ADMIN ========== */
            	    .requestMatchers("/api/admin/**").hasRole("ADMIN")

            	    /* ========== VET APIs ========== */
            	    
            	 // OWNER + VET → VIEW BOOKED SLOTS
            	    .requestMatchers(HttpMethod.GET, "/api/vet/*/slots")
            	        .hasAnyRole("OWNER", "VET", "ADMIN")

            	    .requestMatchers(HttpMethod.GET, "/api/pets/*/overview/vet").hasRole("VET")
            	    .requestMatchers(HttpMethod.PUT, "/api/appointments/*/approve").hasRole("VET")
            	    .requestMatchers(HttpMethod.PUT, "/api/appointments/*/reject").hasRole("VET")
            	    .requestMatchers(HttpMethod.PUT, "/api/appointments/*/notes").hasRole("VET")
            	    .requestMatchers("/api/vet/**").hasRole("VET")

            	    /* ========== OWNER APIs ========== */
            	    .requestMatchers("/api/pets/**").hasRole("OWNER")
            	    .requestMatchers("/owner/**").hasRole("OWNER")
            	    .requestMatchers("/api/vets").hasRole("OWNER")
            	    //change password//
            	    .requestMatchers("/api/user/change-password").hasAnyRole("OWNER", "VET", "ADMIN")


            	    .anyRequest().authenticated()
            	);

        http.addFilterBefore(jwtFilter(), UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}
