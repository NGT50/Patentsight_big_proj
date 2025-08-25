package com.patentsight.review.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class RecentActivityResponse {
    private Long activityId;      // 활동 ID
    private String reviewId;      // 예: P-2024-001
    private String patentTitle;   // 특허 제목
    private String activityType;  // 예: "심사 결과 등록 (등록결정)"
    private LocalDateTime activityDate; // 활동 시간
}
