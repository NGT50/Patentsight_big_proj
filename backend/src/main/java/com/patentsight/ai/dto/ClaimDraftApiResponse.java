package com.patentsight.ai.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;
import java.util.Map;

public class ClaimDraftApiResponse {
    @JsonProperty("rag_context")
    private List<RagMeta> ragContext;
    @JsonProperty("sections_parsed")
    private Map<String, Object> sectionsParsed;

    public List<RagMeta> getRagContext() {
        return ragContext;
    }

    public void setRagContext(List<RagMeta> ragContext) {
        this.ragContext = ragContext;
    }

    public Map<String, Object> getSectionsParsed() {
        return sectionsParsed;
    }

    public void setSectionsParsed(Map<String, Object> sectionsParsed) {
        this.sectionsParsed = sectionsParsed;
    }
}
