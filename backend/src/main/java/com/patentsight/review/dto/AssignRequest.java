package com.patentsight.review.dto;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class AssignRequest {
    private String applicationNumber;
    private Long examinerId;
}
