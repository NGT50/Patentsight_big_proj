package com.patentsight.ai.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;

public class ClaimDraftApiResponse {
    @JsonProperty("rag_context")
    private String ragContext;
    @JsonProperty("sections_raw")
    private Map<String, Object> sectionsRaw;
    @JsonProperty("sections_parsed")
    private Map<String, Object> sectionsParsed;

    public String getRagContext() {
        return ragContext;
    }

    public void setRagContext(String ragContext) {
        this.ragContext = ragContext;
    }

    public Map<String, Object> getSectionsRaw() {
        return sectionsRaw;
    }

    public void setSectionsRaw(Map<String, Object> sectionsRaw) {
        this.sectionsRaw = sectionsRaw;
    }

    public Map<String, Object> getSectionsParsed() {
        return sectionsParsed;
    }

    public void setSectionsParsed(Map<String, Object> sectionsParsed) {
        this.sectionsParsed = sectionsParsed;
    }
}
