package com.patentsight.ai.dto;

import java.util.List;

public class ChatMessageResponse {
    private String messageId;
    private String sender;
    private String content;
    private List<String> executedFeatures;
    private List<String> featuresResult;
    private String createdAt;

    // ✅ 이 생성자 추가!
    public ChatMessageResponse(String messageId, String sender, String content,
                               List<String> executedFeatures, List<String> featuresResult, String createdAt) {
        this.messageId = messageId;
        this.sender = sender;
        this.content = content;
        this.executedFeatures = executedFeatures;
        this.featuresResult = featuresResult;
        this.createdAt = createdAt;
    }

    public String getMessageId() {
        return messageId;
    }

    public void setMessageId(String messageId) {
        this.messageId = messageId;
    }

    public String getSender() {
        return sender;
    }

    public void setSender(String sender) {
        this.sender = sender;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public List<String> getExecutedFeatures() {
        return executedFeatures;
    }

    public void setExecutedFeatures(List<String> executedFeatures) {
        this.executedFeatures = executedFeatures;
    }

    public List<String> getFeaturesResult() {
        return featuresResult;
    }

    public void setFeaturesResult(List<String> featuresResult) {
        this.featuresResult = featuresResult;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }
}
