package com.patentsight.backend.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "patents")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Patent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long patentId;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String type; // PATENT / TRADEMARK / DESIGN

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "applicant_id")
    private User applicant;

    @Column(nullable = false)
    private String status = "SUBMITTED"; // SUBMITTED / UNDER_REVIEW / APPROVED / REJECTED

    private LocalDateTime submittedAt = LocalDateTime.now();
}
