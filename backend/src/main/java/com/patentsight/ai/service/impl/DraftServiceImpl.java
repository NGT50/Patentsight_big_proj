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
        String title = getString(parsed, "발명의 명칭");
        String summary = getString(parsed, "요약");
        String technicalField = getString(parsed, "기술 분야");
        String backgroundTechnology = getString(parsed, "배경 기술");
        DraftResponse.InventionDetails details = new DraftResponse.InventionDetails();
        details.setProblemToSolve(getString(parsed, "해결하려는 과제"));
        details.setSolution(getString(parsed, "과제의 해결 수단"));
        details.setEffect(getString(parsed, "발명의 효과"));
        List<String> claims = parseClaims(parsed.get("청구항"));

        return new DraftResponse(
                UUID.randomUUID().toString(),
                apiRes.getRagContext(),
                title,
                summary,
                technicalField,
                backgroundTechnology,
                details,
                claims
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

    private String getString(Map<String, Object> map, String key) {
        if (map == null) return null;
        Object val = map.get(key);
        return val instanceof String ? (String) val : null;
    }

    private List<String> parseClaims(Object claimsObj) {
        if (claimsObj instanceof List) {
            //noinspection unchecked
            return (List<String>) claimsObj;
        } else if (claimsObj instanceof String) {
            String[] parts = ((String) claimsObj).split("\n\n");
            return java.util.Arrays.stream(parts)
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .toList();
        }
        return java.util.Collections.emptyList();
    }
}
