package com.patentsight.ai.service;

import com.patentsight.ai.dto.AiCheckRequest;
import com.patentsight.ai.dto.AiCheckResponse;

public interface ValidationService {
    // 기존 메소드 (JSON 직접 받기)
    AiCheckResponse validateDocument(AiCheckRequest request);

    // 새로 추가할 메소드 (ID로 찾아와서 검증하기)
    AiCheckResponse validateDocument(Long patentId);
}