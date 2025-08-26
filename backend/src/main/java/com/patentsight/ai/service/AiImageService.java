package com.patentsight.ai.service;

import com.patentsight.ai.dto.Generated3DModelResponse;
import com.patentsight.ai.dto.ImageIdRequest;

public interface AiImageService {
    Generated3DModelResponse generate3DModel(ImageIdRequest request);
}
