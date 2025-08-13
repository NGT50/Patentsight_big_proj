package com.patentsight.ai.service;

import com.patentsight.ai.dto.ClaimDraftDetails;
import com.patentsight.ai.dto.DraftDetailResponse;

public interface AiService {
    DraftDetailResponse generateRejectionDraft(Long patentId, Long fileId);

    ClaimDraftDetails generateClaimDraft(String query, Integer topK);
}