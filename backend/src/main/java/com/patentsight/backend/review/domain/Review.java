package com.patentsight.backend.review.domain;

import com.patentsight.backend.user.domain.User;
import com.patentsight.backend.patent.domain.Patent;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "review")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long reviewId;

    @ManyToOne
    @JoinColumn(name = "patent_id", nullable = false)
    private Patent patent;

    @ManyToOne
    @JoinColumn(name = "examiner_id", nullable = false)
    private User examiner;

    @Enumerated(EnumType.STRING)
    private Decision decision; // APPROVE, PENDING, REJECT

    private String comment;

    private LocalDateTime reviewedAt;

    public enum Decision {
        APPROVE, PENDING, REJECT
    }
}
