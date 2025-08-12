package com.patentsight.ai.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class ClaimDraftRequest {
    private String query;
    @JsonProperty("top_k")
    private Integer topK;

    public String getQuery() {
        return query;
    }

    public void setQuery(String query) {
        this.query = query;
    }

    public Integer getTopK() {
        return topK;
    }

    public void setTopK(Integer topK) {
        this.topK = topK;
    }
}
