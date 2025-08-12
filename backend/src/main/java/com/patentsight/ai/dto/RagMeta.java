package com.patentsight.ai.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class RagMeta {
    private int rank;
    private double score;
    @JsonProperty("app_num")
    private String appNum;
    @JsonProperty("claim_num")
    private Integer claimNum;
    private String text;

    public int getRank() {
        return rank;
    }

    public void setRank(int rank) {
        this.rank = rank;
    }

    public double getScore() {
        return score;
    }

    public void setScore(double score) {
        this.score = score;
    }

    public String getAppNum() {
        return appNum;
    }

    public void setAppNum(String appNum) {
        this.appNum = appNum;
    }

    public Integer getClaimNum() {
        return claimNum;
    }

    public void setClaimNum(Integer claimNum) {
        this.claimNum = claimNum;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }
}
