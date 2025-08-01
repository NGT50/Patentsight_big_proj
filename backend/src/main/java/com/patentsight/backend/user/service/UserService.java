package com.patentsight.backend.user.service;

import com.patentsight.backend.user.domain.User;
import com.patentsight.backend.user.dto.*;
import com.patentsight.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.patentsight.backend.config.JwtTokenProvider;

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
        // 입력한 코드가 목록에 존재하면 true, 아니면 false
        boolean isValid = EXAMINER_CODES.contains(request.auth_code());
        return new VerifyExaminerResponse(isValid);
    }

    // 🔹 기존 회원가입/로그인 메서드 유지
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
        return new UserResponse(saved.getId(), saved.getUsername(), saved.getRole());
    }

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
                .role("EXAMINER")
                .build();

        User saved = userRepository.save(user);
        return new UserResponse(saved.getId(), saved.getUsername(), saved.getRole());
    }
    public LoginResponse login(LoginRequest request) {
        var user = userRepository.findByUsername(request.username())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        String token = jwtTokenProvider.createToken(user.getId(), user.getUsername(), user.getRole());

        return new LoginResponse(token, user.getId(), user.getUsername(), user.getRole());
    }
}
