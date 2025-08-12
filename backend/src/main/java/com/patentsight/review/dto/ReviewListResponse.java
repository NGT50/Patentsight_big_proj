package com.patentsight.review.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.ToString;

@Getter
@Builder
@ToString // 디버깅을 위해 추가하면 좋습니다.
public class ReviewListResponse {
    private Long reviewId;
    private String patentTitle;
    private String applicantName;
    private String examinerName;
    private String status;
    private String receptionDate; // [추가] 이 필드가 필요합니다.
}