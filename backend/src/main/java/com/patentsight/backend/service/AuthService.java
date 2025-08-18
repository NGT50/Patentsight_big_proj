package com.patentsight.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class AuthService {

    public enum VerificationResult {
        SUCCESS,
        UNAUTHORIZED,
        FORBIDDEN
    }

    private final RestTemplate restTemplate;
    private final String verificationUrl;

    public AuthService(RestTemplateBuilder restTemplateBuilder,
                       @Value("${auth.verification-url}") String verificationUrl) {
        this.restTemplate = restTemplateBuilder.build();
        this.verificationUrl = verificationUrl;
    }

    public VerificationResult verify(String code) {
        try {
            ResponseEntity<Void> response = restTemplate.postForEntity(
                    verificationUrl, Map.of("code", code), Void.class);
            HttpStatus status = response.getStatusCode();
            if (status.is2xxSuccessful()) {
                return VerificationResult.SUCCESS;
            } else if (status == HttpStatus.FORBIDDEN) {
                return VerificationResult.FORBIDDEN;
            } else {
                return VerificationResult.UNAUTHORIZED;
            }
        } catch (HttpClientErrorException e) {
            HttpStatus status = e.getStatusCode();
            if (status == HttpStatus.FORBIDDEN) {
                return VerificationResult.FORBIDDEN;
            }
            return VerificationResult.UNAUTHORIZED;
        }
    }
}
