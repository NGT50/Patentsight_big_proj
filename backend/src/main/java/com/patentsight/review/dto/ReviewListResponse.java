// com.patentsight.review.dto.ReviewListResponse
package com.patentsight.review.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.patentsight.review.domain.Review;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class ReviewListResponse {
    private Long reviewId;
    private String patentTitle;
    private String applicantName;
    private String examinerName;
    private String status;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate submittedAt;

    // 🔹 JPQL constructor expression용 오버로드
    public ReviewListResponse(
            Long reviewId,
            String patentTitle,
            String applicantName,
            String examinerName,
            Review.Decision decision,
            LocalDateTime submittedAt
    ) {
        this.reviewId = reviewId;
        this.patentTitle = patentTitle;
        this.applicantName = applicantName;
        this.examinerName = examinerName;
        this.status = (decision != null ? decision.name() : null);
        this.submittedAt = (submittedAt != null ? submittedAt.toLocalDate() : null);
    }
}
