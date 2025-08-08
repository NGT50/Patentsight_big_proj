package com.patentsight.ai.dto;

public class SimilarSearchRequest {
    private Long patentId;
    private String inputText; // 검색 기준 텍스트 (ex. 청구항, 설명 등)

    public Long getPatentId() {
        return patentId;
    }

    public void setPatentId(Long patentId) {
        this.patentId = patentId;
    }

    public String getInputText() {
        return inputText;
    }

    public void setInputText(String inputText) {
        this.inputText = inputText;
    }
}
