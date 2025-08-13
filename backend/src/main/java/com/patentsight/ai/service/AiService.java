package com.patentsight.ai.service;

import com.patentsight.ai.dto.DraftDetailResponse;

public interface AiService {
    DraftDetailResponse generateRejectionDraft(Long patentId, Long fileId);

    DraftDetailResponse generateClaimDraft(String query, Integer topK);
}