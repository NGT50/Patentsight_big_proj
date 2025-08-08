package com.patentsight.ai.dto;

public class ChatSessionResponse {
    private String sessionId;
    private String startedAt;

    public ChatSessionResponse(String sessionId, String startedAt) {
        this.sessionId = sessionId;
        this.startedAt = startedAt;
    }

    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }

    public String getStartedAt() {
        return startedAt;
    }

    public void setStartedAt(String startedAt) {
        this.startedAt = startedAt;
    }
}
