package com.patentsight.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())  // REST API니까 CSRF 비활성화
                .headers(headers -> headers.frameOptions(frame -> frame.disable())) // 🔹 H2 콘솔 Frame 허용
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/api/users/applicant",
                                "/api/users/examiner",
                                "/api/users/login",
                                "/api/users/verify-code",
                                "/h2-console/**" // 🔹 H2 콘솔 접근 허용
                        ).permitAll()
                        .anyRequest().authenticated()
                );

        return http.build();
    }
}
