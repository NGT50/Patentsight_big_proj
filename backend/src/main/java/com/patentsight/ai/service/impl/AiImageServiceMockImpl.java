package com.patentsight.ai.service.impl;

import com.patentsight.ai.dto.ImageSimilarityRequest;
import com.patentsight.ai.dto.ImageSimilarityResponse;
import com.patentsight.ai.dto.ImageIdRequest;
import com.patentsight.ai.dto.Generated3DModelResponse;
import com.patentsight.ai.service.AiImageService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AiImageServiceMockImpl implements AiImageService {

    @Override
    public List<ImageSimilarityResponse> analyzeImageSimilarity(ImageSimilarityRequest request) {
        return request.getImageIds().stream()
                .map(id -> new ImageSimilarityResponse(id, Math.random())) // 0~1 사이 랜덤 유사도
                .collect(Collectors.toList());
    }

    @Override
    public Generated3DModelResponse generate3DModel(ImageIdRequest request) {
        return new Generated3DModelResponse(
                "result-" + request.getImageId(),
                "/mock/path/3dmodel/" + request.getImageId() + ".obj"
        );
    }
}
