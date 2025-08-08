package com.patentsight.ai.dto;

public class ActionLogResponse {
    private String actionId;
    private String actionType;
    private String actionInput;
    private String actionOutput;
    private String status;
    private String createdAt;

    public ActionLogResponse(String actionId, String actionType, String actionInput, String actionOutput, String status, String createdAt) {
        this.actionId = actionId;
        this.actionType = actionType;
        this.actionInput = actionInput;
        this.actionOutput = actionOutput;
        this.status = status;
        this.createdAt = createdAt;
    }

    // Getters and Setters 생략 가능 (Lombok 써도 OK)
}
