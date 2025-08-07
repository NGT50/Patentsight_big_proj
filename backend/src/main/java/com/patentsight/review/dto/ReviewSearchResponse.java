package com.patentsight.review.dto;

import com.patentsight.review.domain.Review;
import com.patentsight.patent.domain.PatentType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data // @Getter, @Setter, @ToString, @EqualsAndHashCode, @RequiredArgsConstructor 포함
@NoArgsConstructor
@AllArgsConstructor
@Builder // ✅ 이 어노테이션을 추가해야 합니다.
public class ReviewSearchResponse {
    private Long reviewId;
    private String patentTitle;
    private String applicantName;
    private String status; // ✅ Review.Decision -> String으로 변경
    private PatentType reviewType;
    private boolean autoAssigned;
    private LocalDateTime reviewedAt;
}
