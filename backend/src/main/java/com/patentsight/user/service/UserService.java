package com.patentsight.user.service;

import com.patentsight.config.JwtTokenProvider;
import com.patentsight.user.domain.User;
import com.patentsight.user.dto.*;
import com.patentsight.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Set;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    // 🔹 심사관 인증용 고정 코드 목록
    private static final Set<String> EXAMINER_CODES = Set.of(
            "123", "234", "345", "456", "2344"
    );

    // 🔹 심사관 코드 검증
    public VerifyExaminerResponse verifyExaminer(VerifyExaminerRequest request) {
        boolean isValid = EXAMINER_CODES.contains(request.authCode());
        return new VerifyExaminerResponse(isValid);
    }

    // 🔹 출원인 회원가입
    public UserResponse createApplicant(ApplicantSignupRequest request) {
        if (userRepository.existsByUsername(request.username())) {
            throw new RuntimeException("Username already exists");
        }

        User user = User.builder()
                .username(request.username())
                .password(passwordEncoder.encode(request.password()))
                .name(request.name())
                .birthDate(request.birthDate())
                .email(request.email())
                .role("APPLICANT")
                .build();

        User saved = userRepository.save(user);
        return new UserResponse(saved.getUserId(), saved.getUsername(), saved.getRole());
    }

    // ✅ 심사관 회원가입 (사원번호 + 직급 추가됨)
    public UserResponse createExaminer(ExaminerSignupRequest request) {
        if (userRepository.existsByUsername(request.username())) {
            throw new RuntimeException("Username already exists");
        }

        User user = User.builder()
                .username(request.username())
                .password(passwordEncoder.encode(request.password()))
                .name(request.name())
                .birthDate(request.birthDate())
                .department(request.department())
                .employeeNumber(request.employeeNumber()) // 🔹 사원번호 추가
                .position(request.position())             // 🔹 직급 추가
                .role("EXAMINER")
                .build();

        User saved = userRepository.save(user);
        return new UserResponse(saved.getUserId(), saved.getUsername(), saved.getRole());
    }

    // 🔹 로그인
    public LoginResponse login(LoginRequest request) {
        var user = userRepository.findByUsername(request.username())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        String token = jwtTokenProvider.createToken(user.getUserId(), user.getUsername(), user.getRole());

        return new LoginResponse(token, user.getUserId(), user.getUsername(), user.getName(), user.getRole());
    }
}
