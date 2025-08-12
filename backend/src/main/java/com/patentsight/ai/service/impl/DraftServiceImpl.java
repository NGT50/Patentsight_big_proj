package com.patentsight.ai.service.impl;

import com.patentsight.ai.client.ClaimDraftApiClient;
import com.patentsight.ai.dto.*;
import com.patentsight.ai.service.DraftService;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class DraftServiceImpl implements DraftService {

    private final ClaimDraftApiClient apiClient;

    public DraftServiceImpl(ClaimDraftApiClient apiClient) {
        this.apiClient = apiClient;
    }

    @Override
    public DraftResponse generateClaimDraft(ClaimDraftRequest request) {
        ClaimDraftApiResponse apiRes = apiClient.generate(request).block();
        if (apiRes == null) {
            throw new RuntimeException("Failed to generate claim draft");
        }
        Map<String, Object> parsed = apiRes.getSectionsParsed();
        String draftText = null;
        if (parsed != null && parsed.get("청구항") instanceof String) {
            draftText = (String) parsed.get("청구항");
        }
        return new DraftResponse(
                UUID.randomUUID().toString(),
                draftText,
                apiRes.getRagContext(),
                apiRes.getSectionsParsed()
        );
    }

    @Override
    public DraftResponse generateRejectionDraft(Long patentId) {
        throw new UnsupportedOperationException("Rejection draft not implemented");
    }

    @Override
    public List<DraftListResponse> getDrafts(Long patentId) {
        return Collections.emptyList();
    }

    @Override
    public void deleteDrafts(Long patentId) {
        // no-op
    }
}
