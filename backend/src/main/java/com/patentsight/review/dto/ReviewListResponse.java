package com.patentsight.review.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class ReviewListResponse {
    private Long reviewId;
    private String patentTitle;
    private String status;
}

