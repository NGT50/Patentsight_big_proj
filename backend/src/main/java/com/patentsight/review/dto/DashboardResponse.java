package com.patentsight.review.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.ToString;

@Getter
@Builder
@ToString // 디버깅을 위해 추가하면 좋습니다.
public class DashboardResponse {
    private long total;
    private long submitted; // [추가] 이 필드가 필요합니다.
    private long inReview;
    private long completed;
    private long rejected;  // [추가] 이 필드가 필요합니다.
}