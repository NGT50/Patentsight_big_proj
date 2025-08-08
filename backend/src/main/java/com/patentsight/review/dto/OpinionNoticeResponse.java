package com.patentsight.review.dto;

import lombok.*;
import com.patentsight.review.domain.OpinionType;

import java.time.LocalDateTime;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class OpinionNoticeResponse {
    private Long noticeId;
    private Long reviewId;
    private OpinionType type;
    private String content;
    private String structuredContent;
    private Boolean isAiDrafted;
    private String status;                // WAITING / SUBMITTED 등
    private LocalDateTime responseDueDate;
    private LocalDateTime createdAt;
}
