package com.patentsight.review.dto;

import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class ReviewListResponse {
    private Long reviewId;
    private String patentTitle;
    private String applicantName;
    private String examinerName;
    private String status;
}