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
<<<<<<< HEAD
    private Decision decision; // [수정] Enum 확장

    @Column(columnDefinition = "TEXT")
    private String comment;
    
    private LocalDateTime reviewedAt;

=======
    private Decision decision; // APPROVE / PENDING / REJECT

    private String comment;
    private LocalDateTime reviewedAt;

    // 🔹 reviewType을 enum으로 변경
>>>>>>> origin/woncicd
    @Enumerated(EnumType.STRING)
    private PatentType reviewType;

    private boolean autoAssigned; // 자동 배정 여부

<<<<<<< HEAD
    /**
     * [수정] 심사 결정 상태 Enum
     * PENDING을 제거하고 SUBMITTED, REVIEWING을 추가하여 상태를 명확하게 관리합니다.
     */
    public enum Decision {
        SUBMITTED,  // 심사대기 (심사관 배정 직후)
        REVIEWING,  // 심사중 (심사관이 의견 작성 등 작업을 시작한 상태)
        APPROVE,    // 승인
        REJECT      // 거절
=======
    public enum Decision {
        APPROVE, PENDING, REJECT
>>>>>>> origin/woncicd
    }
}
