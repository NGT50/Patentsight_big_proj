package com.patentsight.ai.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public class DraftResponse {
    @JsonProperty("log_id")
    private String logId;
    @JsonProperty("rag_context")
    private List<RagMeta> ragContext;
    private String title;
    private String summary;
    private String technicalField;
    private String backgroundTechnology;
    private InventionDetails inventionDetails;
    private List<String> claims;

    public DraftResponse() {}

    public DraftResponse(String logId, List<RagMeta> ragContext, String title,
                         String summary, String technicalField, String backgroundTechnology,
                         InventionDetails inventionDetails, List<String> claims) {
        this.logId = logId;
        this.ragContext = ragContext;
        this.title = title;
        this.summary = summary;
        this.technicalField = technicalField;
        this.backgroundTechnology = backgroundTechnology;
        this.inventionDetails = inventionDetails;
        this.claims = claims;
    }

    public String getLogId() { return logId; }
    public void setLogId(String logId) { this.logId = logId; }

    public List<RagMeta> getRagContext() { return ragContext; }
    public void setRagContext(List<RagMeta> ragContext) { this.ragContext = ragContext; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }

    public String getTechnicalField() { return technicalField; }
    public void setTechnicalField(String technicalField) { this.technicalField = technicalField; }

    public String getBackgroundTechnology() { return backgroundTechnology; }
    public void setBackgroundTechnology(String backgroundTechnology) { this.backgroundTechnology = backgroundTechnology; }

    public InventionDetails getInventionDetails() { return inventionDetails; }
    public void setInventionDetails(InventionDetails inventionDetails) { this.inventionDetails = inventionDetails; }

    public List<String> getClaims() { return claims; }
    public void setClaims(List<String> claims) { this.claims = claims; }

    public static class InventionDetails {
        private String problemToSolve;
        private String solution;
        private String effect;

        public String getProblemToSolve() { return problemToSolve; }
        public void setProblemToSolve(String problemToSolve) { this.problemToSolve = problemToSolve; }

        public String getSolution() { return solution; }
        public void setSolution(String solution) { this.solution = solution; }

        public String getEffect() { return effect; }
        public void setEffect(String effect) { this.effect = effect; }
    }
}
