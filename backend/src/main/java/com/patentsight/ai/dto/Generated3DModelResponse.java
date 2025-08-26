package com.patentsight.ai.dto;

public class Generated3DModelResponse {
    private Long fileId;
    private String fileUrl;

    public Generated3DModelResponse() {
    }

    public Generated3DModelResponse(Long fileId, String fileUrl) {
        this.fileId = fileId;
        this.fileUrl = fileUrl;
    }

    public Long getFileId() {
        return fileId;
    }

    public void setFileId(Long fileId) {
        this.fileId = fileId;
    }

    public String getFileUrl() {
        return fileUrl;
    }

    public void setFileUrl(String fileUrl) {
        this.fileUrl = fileUrl;
    }
}
