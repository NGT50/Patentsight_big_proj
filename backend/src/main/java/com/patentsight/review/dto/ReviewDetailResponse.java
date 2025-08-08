package com.patentsight.review.dto;

import com.patentsight.review.domain.Review;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class ReviewDetailResponse {
    private Long reviewId;
    private Long patentId;
    private String patentTitle;
    private String applicantName;
    private String examinerName;
    private Review.Decision decision;
    private String comment;
    private LocalDateTime reviewedAt;
    private List<String> claims;         // 청구항
    private String summary;              // 발명 요약
    private List<String> aiChecks;       // AI 점검 결과

    // 필요한 경우 생성자에서 Review 엔티티를 받아 변환 가능
}
