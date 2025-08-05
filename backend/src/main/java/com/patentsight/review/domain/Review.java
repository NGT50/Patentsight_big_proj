package com.patentsight.review.domain;

import com.patentsight.patent.domain.Patent;
import com.patentsight.patent.domain.PatentType;
import com.patentsight.user.domain.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long reviewId;

    @ManyToOne
    @JoinColumn(name = "patent_id")
    private Patent patent;  // 출원 서류

    @ManyToOne
    @JoinColumn(name = "examiner_id")
    private User examiner;  // 심사관

    @Enumerated(EnumType.STRING)
    private Decision decision; // APPROVE / PENDING / REJECT

    private String comment;
    private LocalDateTime reviewedAt;

    // 🔹 reviewType을 enum으로 변경
    @Enumerated(EnumType.STRING)
    private PatentType reviewType;

    private boolean autoAssigned; // 자동 배정 여부

    public enum Decision {
        APPROVE, PENDING, REJECT
    }
}
