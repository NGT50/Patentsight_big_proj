package com.patentsight.ai.dto;

public class AiCheckResponse {
    private String checkId;
    private String status; // 예: "PROCESSING", "DONE"

    public AiCheckResponse(String checkId, String status) {
        this.checkId = checkId;
        this.status = status;
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
}
