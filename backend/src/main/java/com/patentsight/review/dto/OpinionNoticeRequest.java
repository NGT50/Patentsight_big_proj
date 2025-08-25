package com.patentsight.review.dto;

import com.patentsight.review.domain.OpinionType;
import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class OpinionNoticeRequest {
    private String content;               // 의견서 본문
    private String structuredContent;     // JSON 구조 (옵션)
    private Boolean isAiDrafted;          // AI 초안 여부
    private LocalDateTime responseDueDate;// 회신 마감일 (옵션)
    private OpinionType opinionType;             // APPROVAL or REJECTION
}
