package com.patentsight.patent.dto;

import com.patentsight.patent.domain.PatentStatus;
import com.patentsight.patent.domain.PatentType;
import java.util.List;

public class PatentResponse {
    private Long patentId;
    private String title;
    private PatentType type;
    private PatentStatus status;
    private List<Long> attachmentIds;

    public Long getPatentId() { return patentId; }
    public void setPatentId(Long patentId) { this.patentId = patentId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public PatentType getType() { return type; }
    public void setType(PatentType type) { this.type = type; }
    public PatentStatus getStatus() { return status; }
    public void setStatus(PatentStatus status) { this.status = status; }
    public List<Long> getAttachmentIds() { return attachmentIds; }
    public void setAttachmentIds(List<Long> attachmentIds) { this.attachmentIds = attachmentIds; }
}
