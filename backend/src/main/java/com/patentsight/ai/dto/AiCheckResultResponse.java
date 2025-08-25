package com.patentsight.ai.dto;

import java.util.List;

public class AiCheckResultResponse {
    private String checkId;
    private String status;
    private List<String> issues;

    public AiCheckResultResponse(String checkId, String status, List<String> issues) {
        this.checkId = checkId;
        this.status = status;
        this.issues = issues;
    }

    public String getCheckId() {
        return checkId;
    }

    public void setCheckId(String checkId) {
        this.checkId = checkId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public List<String> getIssues() {
        return issues;
    }

    public void setIssues(List<String> issues) {
        this.issues = issues;
    }
}
