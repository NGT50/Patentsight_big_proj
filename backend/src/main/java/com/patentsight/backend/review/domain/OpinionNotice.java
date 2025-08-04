package com.patentsight.backend.review.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "opinion_notice")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class OpinionNotice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long noticeId;

    @ManyToOne
    @JoinColumn(name = "review_id", nullable = false)
    private Review review;

    @Lob
    private String content;

    @Lob
    private String structuredContent; // JSON 구조

    private LocalDateTime responseDueDate;

    private Boolean isAiDrafted;

    private LocalDateTime createdAt;
}
