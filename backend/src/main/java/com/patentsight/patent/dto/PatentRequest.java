package com.patentsight.patent.dto;

import com.patentsight.patent.domain.PatentType;
import java.util.List;

public class PatentRequest {
    private String title;
    private PatentType type;
    private List<Long> fileIds;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public PatentType getType() { return type; }
    public void setType(PatentType type) { this.type = type; }
    public List<Long> getFileIds() { return fileIds; }
    public void setFileIds(List<Long> fileIds) { this.fileIds = fileIds; }
}
