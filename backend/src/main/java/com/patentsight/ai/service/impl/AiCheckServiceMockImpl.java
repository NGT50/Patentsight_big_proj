package com.patentsight.ai.service.impl;

import com.patentsight.ai.dto.AiCheckResponse;
import com.patentsight.ai.dto.AiCheckResultResponse;
import com.patentsight.ai.service.AiCheckService;
import org.springframework.stereotype.Service;

import java.util.Arrays;

@Service
public class AiCheckServiceMockImpl implements AiCheckService {

    @Override
    public AiCheckResponse runAiCheck(Long patentId) {
        return new AiCheckResponse("check-" + patentId, "PROCESSING");
    }

    @Override
    public AiCheckResultResponse getAiCheckResult(String checkId) {
        return new AiCheckResultResponse(
                checkId,
                "DONE",
                Arrays.asList("청구항 1이 명확하지 않음", "청구항 3이 중복됨")
        );
    }
}
