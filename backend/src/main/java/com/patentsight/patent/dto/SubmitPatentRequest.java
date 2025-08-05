package com.patentsight.patent.dto;

import java.util.List;

public class SubmitPatentRequest {
    private List<String> classificationCodes;

    public List<String> getClassificationCodes() {
        return classificationCodes;
    }

    public void setClassificationCodes(List<String> classificationCodes) {
        this.classificationCodes = classificationCodes;
    }
}
