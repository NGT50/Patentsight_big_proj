package com.patentsight.review.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardResponse {
    private Long totalReviews;          // ✅ 전체 심사 수 (이름 변경)
    private Long pendingReviews;        // ✅ 심사중 (이름 변경)
    private Long thisMonthReceptions;   // ✅ 이번 달 접수 (필드 추가)
    private Long sevenDaysOverWaiting;  // ✅ 7일 이상 심사대기 (필드 추가)
    // 기존 inReview, completed 필드는 필요에 따라 유지하거나,
    // totalReviews, pendingReviews로 대체하여 사용합니다.
    // 여기서는 ReviewServiceImpl에서 사용하는 필드명에 맞추어 변경했습니다.
}
