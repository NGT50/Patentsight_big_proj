package com.patentsight.ai.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class Generate3DModelApiResponse {
    @JsonProperty("result_id")
    private String resultId;

    @JsonProperty("file_path")
    private String filePath;

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
