package com.patentsight.backend.user.domain;

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
    private Long id;

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
    private DepartmentType department;   // 심사관 전용

    @Column(nullable = false)
    private String role;  // APPLICANT / EXAMINER / ADMIN

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }
}
