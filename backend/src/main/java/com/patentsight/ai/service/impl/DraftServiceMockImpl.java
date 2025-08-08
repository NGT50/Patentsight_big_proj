package com.patentsight.ai.service.impl;

import com.patentsight.ai.dto.DraftResponse;
import com.patentsight.ai.dto.DraftListResponse;
import com.patentsight.ai.service.DraftService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Arrays;

@Service
public class DraftServiceMockImpl implements DraftService {

    @Override
    public DraftResponse generateClaimDraft(Long patentId) {
        return new DraftResponse("log-claim-123", "임시 청구항 초안입니다.");
    }

    @Override
    public DraftResponse generateRejectionDraft(Long patentId) {
        return new DraftResponse("log-rejection-456", "임시 거절 사유 초안입니다.");
    }

    @Override
    public List<DraftListResponse> getDrafts(Long patentId) {
        return Arrays.asList(
                new DraftListResponse(1L, "CLAIM", "임시 청구항 초안"),
                new DraftListResponse(2L, "REJECTION", "임시 거절 사유 초안")
        );
    }

    @Override
    public void deleteDrafts(Long patentId) {
        // 실제 삭제 로직은 생략
    }
}
