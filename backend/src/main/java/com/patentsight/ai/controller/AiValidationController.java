package com.patentsight.ai.controller;

<<<<<<< HEAD
import com.patentsight.ai.dto.AiCheckRequest;
import com.patentsight.ai.dto.AiCheckResponse;
import com.patentsight.ai.service.ValidationService; // 다음 단계에 만들 서비스
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

// ... import 구문
import org.springframework.web.bind.annotation.PathVariable; // PathVariable import

@RestController
@RequiredArgsConstructor
=======
import com.patentsight.ai.dto.PatentIdRequest;
import com.patentsight.ai.dto.ValidationResultResponse;
import com.patentsight.ai.service.ValidationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ai")
>>>>>>> origin/fix/font_design
public class AiValidationController {

    private final ValidationService validationService;

<<<<<<< HEAD
    // 기존 엔드포인트 (JSON 직접 받기)
    @PostMapping("/api/ai/validations")
    public ResponseEntity<AiCheckResponse> validateDocumentByBody(@RequestBody AiCheckRequest request) {
        AiCheckResponse response = validationService.validateDocument(request);
        return ResponseEntity.ok(response);
    }

    // --- 새로 추가할 엔드포인트 (ID로 검증하기) ---
    @PostMapping("/api/ai/patents/{id}/validate")
    public ResponseEntity<AiCheckResponse> validateDocumentById(@PathVariable("id") Long patentId) {
        AiCheckResponse response = validationService.validateDocument(patentId);
        return ResponseEntity.ok(response);
    }
}
=======
    public AiValidationController(ValidationService validationService) {
        this.validationService = validationService;
    }

    @PostMapping("/validations")
    public ResponseEntity<List<ValidationResultResponse>> validatePatentDocument(
            @RequestBody PatentIdRequest request) {
        return ResponseEntity.ok(validationService.validatePatent(request.getPatentId()));
    }
}
>>>>>>> origin/fix/font_design
