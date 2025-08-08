package com.patentsight.ai.dto;

public class DraftResponse {
    private String logId;
    private String draftText;

    public DraftResponse(String logId, String draftText) {
        this.logId = logId;
        this.draftText = draftText;
    }

    public String getLogId() {
        return logId;
    }

    public void setLogId(String logId) {
        this.logId = logId;
    }

    public String getDraftText() {
        return draftText;
    }

    public void setDraftText(String draftText) {
        this.draftText = draftText;
    }
}
