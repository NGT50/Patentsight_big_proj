package com.patentsight.ai.service;

import com.patentsight.ai.dto.DraftResponse;
import com.patentsight.ai.dto.DraftListResponse;

import java.util.List;

public interface DraftService {
    DraftResponse generateClaimDraft(Long patentId);
    DraftResponse generateRejectionDraft(Long patentId);
    List<DraftListResponse> getDrafts(Long patentId);
    void deleteDrafts(Long patentId);
}
