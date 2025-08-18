package com.patentsight.backend.controller;

import com.patentsight.backend.service.AuthService;
import com.patentsight.backend.service.AuthService.VerificationResult;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/examiner")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/verify")
    public ResponseEntity<Void> verify(@RequestBody Map<String, String> body) {
        String code = body.get("code");
        VerificationResult result = authService.verify(code);
        return switch (result) {
            case SUCCESS -> ResponseEntity.ok().build();
            case FORBIDDEN -> ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            default -> ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        };
    }
}
