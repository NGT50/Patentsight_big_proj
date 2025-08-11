package com.patentsight.ai.service;

import com.patentsight.ai.domain.DraftType;
import com.patentsight.ai.dto.DraftDetailResponse;
import com.patentsight.ai.dto.DraftListResponse;

import java.util.List;

public interface DraftService {
    void createDraft(Long patentId, DraftType type, String content);

    List<DraftListResponse> getDrafts(Long patentId);

    DraftDetailResponse getDraft(Long draftId);

    DraftDetailResponse updateDraft(Long draftId, String content);

    DraftDetailResponse createAndReturnDraft(Long patentId, DraftType type, String content);

    void deleteDraft(Long draftId);
}
