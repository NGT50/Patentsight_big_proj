package com.patentsight.review.dto;

import com.patentsight.review.domain.Review;
import com.patentsight.patent.domain.PatentType;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class ReviewSearchResponse {
    private Long reviewId;
    private String patentTitle;
    private String applicantName;
    private Review.Decision status;
    private PatentType reviewType;
    private boolean autoAssigned;
    private LocalDateTime reviewedAt;
}
