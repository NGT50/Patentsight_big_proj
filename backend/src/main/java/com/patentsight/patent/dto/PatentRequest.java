package com.patentsight.patent.dto;

import lombok.Data;

import java.util.List;

@Data
public class PatentRequest {
    private String title;
    private String type;
    private List<Long> fileIds;
}
