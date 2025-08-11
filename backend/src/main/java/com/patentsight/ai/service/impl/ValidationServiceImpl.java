package com.patentsight.ai.service.impl;

// --- 필요한 import 구문들을 추가합니다 ---
import com.patentsight.ai.dto.AiCheckRequest;
import com.patentsight.ai.dto.AiCheckResponse;
import com.patentsight.ai.service.ValidationService;
import com.patentsight.ai.util.ValidationApiClient;
import com.patentsight.patent.domain.Patent;
import com.patentsight.patent.repository.PatentRepository; // **<-- 1. Repository import 추가**
import jakarta.persistence.EntityNotFoundException;     // **<-- 2. Exception import 추가**
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ValidationServiceImpl implements ValidationService {

    private final ValidationApiClient validationApiClient;
    private final PatentRepository patentRepository; // **<-- 3. Repository 필드 선언 추가**

    @Override
    public AiCheckResponse validateDocument(AiCheckRequest request) {
        System.out.println("FastAPI 서버에 문서 검증을 요청합니다...");
        return validationApiClient.requestValidation(request);
    }

    @Override
    public AiCheckResponse validateDocument(Long patentId) {
        // 이제 patentRepository를 정상적으로 사용할 수 있습니다.
        Patent patent = patentRepository.findById(patentId)
                .orElseThrow(() -> new EntityNotFoundException("특허를 찾을 수 없습니다: " + patentId));

        AiCheckRequest requestDto = new AiCheckRequest();
        requestDto.setTitle(patent.getTitle());
        requestDto.setTechnicalField(patent.getTechnicalField());
        requestDto.setBackgroundTechnology(patent.getBackgroundTechnology());
        requestDto.setClaims(patent.getClaims());

        AiCheckRequest.InventionDetails details = new AiCheckRequest.InventionDetails();
        details.setProblemToSolve(patent.getProblemToSolve());
        details.setSolution(patent.getSolution());
        details.setEffect(patent.getEffect());
        requestDto.setInventionDetails(details);

        return this.validateDocument(requestDto);
    }
}