package com.patentsight.ai.dto;

public class SearchResultResponse {
    private String resultId;
    private String title;
    private String ipcCode;
    private double similarity;

    public SearchResultResponse(String resultId, String title, String ipcCode, double similarity) {
        this.resultId = resultId;
        this.title = title;
        this.ipcCode = ipcCode;
        this.similarity = similarity;
    }

    public String getResultId() {
        return resultId;
    }

    public void setResultId(String resultId) {
        this.resultId = resultId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getIpcCode() {
        return ipcCode;
    }

    public void setIpcCode(String ipcCode) {
        this.ipcCode = ipcCode;
    }

    public double getSimilarity() {
        return similarity;
    }

    public void setSimilarity(double similarity) {
        this.similarity = similarity;
    }
}
