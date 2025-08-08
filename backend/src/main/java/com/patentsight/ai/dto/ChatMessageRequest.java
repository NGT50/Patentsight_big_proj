package com.patentsight.ai.dto;

import java.util.List;

public class ChatMessageRequest {
    private String message;
    private List<String> requestedFeatures;

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public List<String> getRequestedFeatures() {
        return requestedFeatures;
    }

    public void setRequestedFeatures(List<String> requestedFeatures) {
        this.requestedFeatures = requestedFeatures;
    }
}
