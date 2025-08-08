package com.patentsight.ai.dto;

public class DraftListResponse {
    private Long draftId;
    private String type;     // CLAIM or REJECTION
    private String content;

    public DraftListResponse(Long draftId, String type, String content) {
        this.draftId = draftId;
        this.type = type;
        this.content = content;
    }

    public Long getDraftId() {
        return draftId;
    }

    public void setDraftId(Long draftId) {
        this.draftId = draftId;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }
}
