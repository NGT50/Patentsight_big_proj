package com.patentsight.ai.service;

import com.patentsight.ai.dto.ImageSimilarityRequest;
import com.patentsight.ai.dto.ImageSimilarityResponse;
import com.patentsight.ai.dto.ImageIdRequest;
import com.patentsight.ai.dto.Generated3DModelResponse;

import java.util.List;

public interface AiImageService {

    List<ImageSimilarityResponse> analyzeImageSimilarity(ImageSimilarityRequest request);

    Generated3DModelResponse generate3DModel(ImageIdRequest request);
}
