package com.patentsight.ai.service;

import com.patentsight.ai.dto.AiCheckResponse;
import com.patentsight.ai.dto.AiCheckResultResponse;

public interface AiCheckService {

    AiCheckResponse runAiCheck(Long patentId);

    AiCheckResultResponse getAiCheckResult(String checkId);
}
