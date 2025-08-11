package com.patentsight.review.dto;

import lombok.*;
import com.patentsight.review.domain.OpinionType;
import com.patentsight.review.domain.OpinionStatus;


import java.time.LocalDateTime;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class OpinionNoticeResponse {
    private Long noticeId;
    private Long reviewId;
    private OpinionType opinionType;
    private String content;
    private String structuredContent;
    private Boolean isAiDrafted;
    private OpinionStatus status;
    private LocalDateTime responseDueDate;
    private LocalDateTime createdAt;
}
