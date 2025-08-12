package com.patentsight.ai.dto;

public class ChatEndResponse {
    private String sessionId;
    private String endedAt;
    private String sessionSummary;

    public ChatEndResponse(String sessionId, String endedAt, String sessionSummary) {
        this.sessionId = sessionId;
        this.endedAt = endedAt;
        this.sessionSummary = sessionSummary;
    }

    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }

    public String getEndedAt() {
        return endedAt;
    }

    public void setEndedAt(String endedAt) {
        this.endedAt = endedAt;
    }

    public String getSessionSummary() {
        return sessionSummary;
    }

    public void setSessionSummary(String sessionSummary) {
        this.sessionSummary = sessionSummary;
    }
}
