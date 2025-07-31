package com.patentsight.backend.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "reviews")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long reviewId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patent_id")
    private Patent patent;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "examiner_id")
    private User examiner;

    @Column(nullable = false)
    private String decision; // APPROVE / REJECT

    @Column(length = 1000)
    private String comment;

    private LocalDateTime reviewedAt = LocalDateTime.now();
}
