package com.patentsight.patent.dto;

import lombok.Data;

import java.util.List;

@Data
public class PatentResponse {
    private Long patentId;
    private String title;
    private String type;
    private List<Long> attachmentIds;
}
