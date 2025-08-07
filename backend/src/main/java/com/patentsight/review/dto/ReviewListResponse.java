package com.patentsight.review.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewListResponse {
    private Long reviewId;
    private String patentTitle;
    private String applicantName;
    private String examinerName;
    private String status;
    private String receptionDate;
    private String field;
    private String description;
    private int reviewProgress;
    private String applicationNumber; // ✅ 출원번호 필드 추가
}
