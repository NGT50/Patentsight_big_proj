package com.patentsight.ai.dto;

public class ImageSimilarityResponse {
    private String imageId;
    private double similarityScore;

    public ImageSimilarityResponse(String imageId, double similarityScore) {
        this.imageId = imageId;
        this.similarityScore = similarityScore;
    }

    public String getImageId() {
        return imageId;
    }

    public void setImageId(String imageId) {
        this.imageId = imageId;
    }

    public double getSimilarityScore() {
        return similarityScore;
    }

    public void setSimilarityScore(double similarityScore) {
        this.similarityScore = similarityScore;
    }
}

