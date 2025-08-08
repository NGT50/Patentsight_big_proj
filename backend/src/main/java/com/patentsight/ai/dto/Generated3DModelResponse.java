package com.patentsight.ai.dto;

public class Generated3DModelResponse {
    private String resultId;
    private String filePath;

    public Generated3DModelResponse(String resultId, String filePath) {
        this.resultId = resultId;
        this.filePath = filePath;
    }

    public String getResultId() {
        return resultId;
    }

    public void setResultId(String resultId) {
        this.resultId = resultId;
    }

    public String getFilePath() {
        return filePath;
    }

    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }
}
