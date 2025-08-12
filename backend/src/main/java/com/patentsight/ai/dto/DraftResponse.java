package com.patentsight.ai.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;

public class DraftResponse {
    @JsonProperty("log_id")
    private String logId;
    @JsonProperty("draft_text")
    private String draftText;
    @JsonProperty("rag_context")
    private String ragContext;
    @JsonProperty("sections_parsed")
    private Map<String, Object> sectionsParsed;

    public DraftResponse() {}

    public DraftResponse(String logId, String draftText, String ragContext,
                         Map<String, Object> sectionsParsed) {
        this.logId = logId;
        this.draftText = draftText;
        this.ragContext = ragContext;
        this.sectionsParsed = sectionsParsed;
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

    public String getRagContext() {
        return ragContext;
    }

    public void setRagContext(String ragContext) {
        this.ragContext = ragContext;
    }

    public Map<String, Object> getSectionsParsed() {
        return sectionsParsed;
    }

    public void setSectionsParsed(Map<String, Object> sectionsParsed) {
        this.sectionsParsed = sectionsParsed;
    }
}
