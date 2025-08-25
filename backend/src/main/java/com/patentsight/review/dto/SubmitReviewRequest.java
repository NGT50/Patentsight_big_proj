package com.patentsight.review.dto;

import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class SubmitReviewRequest {
    private Long reviewId;   // 심사 ID
    private Long patentId;          // 심사 대상 특허 ID
    private String decision;        // SUBMITTED / REVIEWING / APPROVE / REJECT
    private String comment;         // 심사 의견
}
