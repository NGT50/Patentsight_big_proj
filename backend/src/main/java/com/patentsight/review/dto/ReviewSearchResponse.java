package com.patentsight.review.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class ReviewSearchResponse {
    private Long reviewId;
    private String patentTitle;
    private String applicantName;  // 출원인 이름 (없으면 "미확정 출원")
    private String status;
}
