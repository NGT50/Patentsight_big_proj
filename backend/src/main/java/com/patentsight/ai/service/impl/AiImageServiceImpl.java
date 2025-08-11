package com.patentsight.ai.service.impl;

import com.patentsight.ai.client.ThreeDModelApiClient;
import com.patentsight.ai.dto.*;
import com.patentsight.ai.service.AiImageService;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.nio.file.Paths;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AiImageServiceImpl implements AiImageService {

    private final ThreeDModelApiClient threeDModelApiClient;

    public AiImageServiceImpl(ThreeDModelApiClient threeDModelApiClient) {
        this.threeDModelApiClient = threeDModelApiClient;
    }

    @Override
    public List<ImageSimilarityResponse> analyzeImageSimilarity(ImageSimilarityRequest request) {
        return request.getImageIds().stream()
                .map(id -> new ImageSimilarityResponse(id, Math.random()))
                .collect(Collectors.toList());
    }

    @Override
    public Generated3DModelResponse generate3DModel(ImageIdRequest request) {
        Mono<Generate3DModelApiResponse> mono = threeDModelApiClient.generate(
                Paths.get("uploads", request.getImageId() + ".jpg"));
        Generate3DModelApiResponse apiResponse = mono.block();
        return new Generated3DModelResponse(apiResponse.getResultId(), apiResponse.getFilePath());
    }
}
