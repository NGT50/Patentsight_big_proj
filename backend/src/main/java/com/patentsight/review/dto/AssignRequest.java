package com.patentsight.review.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AssignRequest {
    private Long applicantId;
    private Long examinerId;
}