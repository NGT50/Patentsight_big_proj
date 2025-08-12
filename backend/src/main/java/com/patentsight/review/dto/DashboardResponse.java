package com.patentsight.review.dto;

import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class DashboardResponse {
    private Long total;          // 전체 출원 수
    private Long inReview;       // 심사중
    private Long pending;        // 심사대기
    private Long completed;      // 심사완료
}