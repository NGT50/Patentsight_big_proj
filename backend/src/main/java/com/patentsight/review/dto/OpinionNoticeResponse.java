package com.patentsight.review.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class OpinionNoticeResponse {
    private Long noticeId;
    private Long reviewId;
    private String content;
    private String structuredContent;
    private Boolean isAiDrafted;
    private String status;                // WAITING / SUBMITTED 등
    private LocalDateTime responseDueDate;
    private LocalDateTime createdAt;
}
