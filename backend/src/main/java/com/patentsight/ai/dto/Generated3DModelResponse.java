package com.patentsight.ai.dto;

public class Generated3DModelResponse {
    private Long id;
    private String resultId;
    private Long fileId;
    private String fileUrl;

    public Generated3DModelResponse(Long id, String resultId, Long fileId, String fileUrl) {
        this.id = id;
        this.resultId = resultId;
        this.fileId = fileId;
        this.fileUrl = fileUrl;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getResultId() {
        return resultId;
    }

    public void setResultId(String resultId) {
        this.resultId = resultId;
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
