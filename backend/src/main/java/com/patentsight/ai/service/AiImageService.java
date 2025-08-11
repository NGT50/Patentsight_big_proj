package com.patentsight.ai.service;

import com.patentsight.ai.dto.ImageSimilarityRequest;
import com.patentsight.ai.dto.ImageSimilarityResponse;
import com.patentsight.ai.dto.ImageIdRequest;
import com.patentsight.ai.dto.Generated3DModelResponse;
import com.patentsight.file.dto.FileResponse;

import java.util.List;

public interface AiImageService {

    List<ImageSimilarityResponse> analyzeImageSimilarity(ImageSimilarityRequest request);

    Generated3DModelResponse generate3DModel(ImageIdRequest request);

    FileResponse getGenerated3DModel(Long id);
}
