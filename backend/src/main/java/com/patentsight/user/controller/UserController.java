package com.patentsight.user.controller;

import com.patentsight.user.dto.*;
import com.patentsight.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // 출원인 회원가입
    @PostMapping("/applicant")
    public ResponseEntity<UserResponse> signUpApplicant(@RequestBody ApplicantSignupRequest request) {
        return ResponseEntity.ok(userService.createApplicant(request));
    }

    // 심사관 회원가입
    @PostMapping("/examiner")
    public ResponseEntity<UserResponse> signUpExaminer(@RequestBody ExaminerSignupRequest request) {
        return ResponseEntity.ok(userService.createExaminer(request));
    }

    // 로그인
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(userService.login(request));
    }

    // 심사관 코드인증
    @PostMapping("/verify-code")
    public ResponseEntity<VerifyExaminerResponse> verifyExaminer(
            @RequestBody VerifyExaminerRequest request
    ) {
        // 🔹 요청 → Service에서 검증 → 결과 응답
        return ResponseEntity.ok(userService.verifyExaminer(request));
    }
}