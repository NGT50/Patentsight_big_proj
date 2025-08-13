package com.patentsight.ai.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO representing claim draft details returned from the external AI service.
 */
@Data
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class ClaimDraftDetails {

    @JsonProperty("log_id")
    private String logId;

    @JsonProperty("rag_context")
    private List<RagContext> ragContext;

    private String title;
    private String summary;
    private String technicalField;
    private String backgroundTechnology;

    @JsonProperty("inventionDetails")
    private InventionDetails inventionDetails;

    private List<String> claims;

    @Data
    @NoArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class RagContext {
        private Integer rank;
        private Double score;

        @JsonProperty("app_num")
        private String appNum;

        @JsonProperty("claim_num")
        private Integer claimNum;

        private String text;
    }

    @Data
    @NoArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class InventionDetails {
        private String problemToSolve;
        private String solution;
        private String effect;
    }
}

