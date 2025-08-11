package com.patentsight.user.domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class User {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long userId;

    @Column(nullable = false, unique = true)
    private String username;  // 아이디

    @Column(nullable = false)
    private String password;  // 비밀번호

    @Column(nullable = false)
    private String name;      // 이름

    @Column(name = "birth_date")
    private LocalDate birthDate; // 생년월일

    private String email;        // 출원인 전용

    @Enumerated(EnumType.STRING)
    private DepartmentType department;   // 심사관 부서 (PATENT / DESIGN / TRADEMARK)

    @Column(nullable = false)
    private String role;  // APPLICANT / EXAMINER / ADMIN

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // 🔹 현재 담당 심사 건수 (자동 배정용)
    @Column(name = "current_load", nullable = false, columnDefinition = "int default 0")
    private int currentLoad;

    // ✅ 🔹 추가 필드: 사원번호
    private String employeeNumber;

    // ✅ 🔹 추가 필드: 직급
    private String position;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.currentLoad = 0; // 신규 유저는 0건 배정 상태로 시작
    }
}
