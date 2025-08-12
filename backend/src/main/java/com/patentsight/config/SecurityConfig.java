package com.patentsight.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // CORS 설정 Bean 추가
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // 🔹 클라이언트 애플리케이션의 오리진을 명시적으로 허용
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:5173"));
        // 🔹 허용할 HTTP 메서드 설정
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        // 🔹 모든 헤더 허용
        configuration.setAllowedHeaders(Arrays.asList("*"));
        // 🔹 인증 정보(쿠키, HTTP 인증, JWT 등)를 포함한 요청 허용
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // 🔹 모든 URL에 CORS 설정 적용
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable()) // 🔹 REST API라 CSRF 비활성화
                .headers(headers -> headers.frameOptions(frame -> frame.sameOrigin())) // 🔹 H2 콘솔 iframe 허용
                .cors(cors -> cors.configurationSource(corsConfigurationSource())) // 🔹 CORS 설정 적용
                .authorizeHttpRequests(auth -> auth
                        .anyRequest().permitAll() // 🔹 모든 요청 허용
                );
        return http.build();
    }
}
