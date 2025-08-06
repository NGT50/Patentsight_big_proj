package com.patentsight.review.dto;

import com.patentsight.review.domain.Review;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class ReviewResponse {
    private Long reviewId;
    private String reviewType;
    private boolean autoAssigned;
    private Review.Decision decision;
    private LocalDateTime reviewedAt;

    // Review -> DTO 변환 생성자
    public ReviewResponse(Review review) {
        this.reviewId = review.getReviewId();
        this.reviewType = review.getReviewType().name(); // 🔹 Enum → String 변환
        this.autoAssigned = review.isAutoAssigned();
        this.decision = review.getDecision();
        this.reviewedAt = review.getReviewedAt();
    }
}

