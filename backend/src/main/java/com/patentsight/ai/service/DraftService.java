package com.patentsight.ai.service;

import com.patentsight.ai.dto.*;
import java.util.List;

public interface DraftService {
    DraftResponse generateClaimDraft(ClaimDraftRequest request);
    DraftResponse generateRejectionDraft(Long patentId);
    List<DraftListResponse> getDrafts(Long patentId);
    void deleteDrafts(Long patentId);
}
