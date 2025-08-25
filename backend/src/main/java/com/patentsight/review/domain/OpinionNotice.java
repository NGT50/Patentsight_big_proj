package com.patentsight.review.domain;

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
    @Column(name = "notice_id")
    private Long noticeId;

    @ManyToOne
    @JoinColumn(name = "review_id", nullable = false)
    private Review review;

    @Lob
    @Column(name = "content", columnDefinition = "LONGTEXT")
    private String content;

    @Lob
    @Column(name = "structured_content", columnDefinition = "LONGTEXT")
    private String structuredContent; // JSON 구조

    @Column(name = "response_due_date")
    private LocalDateTime responseDueDate;

    @Column(name = "is_ai_drafted")
    private Boolean isAiDrafted;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "type")
    private OpinionType type;

    @Enumerated(EnumType.STRING)
    private OpinionStatus status;

}
