package com.patentsight.review.dto;

import com.patentsight.patent.dto.PatentResponse; // PatentResponse 임포트
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Builder
public class ReviewDetailResponse {
    private Long reviewId;
    private Long patentId;
    private String patentTitle;
    private String applicationNumber;
    private String applicantName;
    private String examinerName;
    private String decision;
    private String comment;
    private LocalDateTime reviewedAt;
    private List<String> claims; // 청구항 (필요시)
    private String summary; // 특허/디자인 요약
    private List<String> aiChecks; // AI 검토 결과 (유사 디자인 등)

    // ✅ PatentResponse 객체 추가
    private PatentResponse patent; 

    // 생성자나 빌더 패턴을 사용하여 모든 필드를 초기화하도록 합니다.
    // Lombok의 @Builder를 사용하면 편리합니다.
}
