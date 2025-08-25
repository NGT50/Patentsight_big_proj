package com.patentsight.ai.service.impl;

import com.patentsight.ai.domain.DraftType;
import com.patentsight.ai.dto.DraftDetailResponse;
import com.patentsight.ai.service.AiService;
import com.patentsight.ai.service.DraftService;
import com.patentsight.file.domain.FileAttachment;
import com.patentsight.file.service.FileService;
import com.patentsight.ai.util.DraftApiClient;
import com.patentsight.ai.util.ClaimDraftClient;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.File;

@Service
@RequiredArgsConstructor
public class AiServiceImpl implements AiService {

    private final FileService fileService;
    private final DraftApiClient draftApiClient;
    private final ClaimDraftClient claimDraftClient;
    private final DraftService draftService;

    @Override
    public DraftDetailResponse generateRejectionDraft(Long patentId, Long fileId) {
        // 📌 1. 파일 정보 조회
        FileAttachment file = fileService.findById(fileId);

        // 📌 2. 로컬 파일 객체 생성 (FastAPI 요청용)
        File localFile = new File(file.getFileUrl());

        // 📌 3. FastAPI 호출하여 opinion 생성
        String opinionText = draftApiClient.requestOpinion(localFile);

        // 📌 4. 초안 DB 저장 및 응답 반환
        return draftService.createAndReturnDraft(patentId, DraftType.REJECTION, opinionText);
    }

    @Override
    public String generateClaimDraft(String query, Integer topK) {
        return claimDraftClient.generate(query, topK);
    }
}
