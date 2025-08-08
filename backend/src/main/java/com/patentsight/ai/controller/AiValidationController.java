package com.patentsight.ai.controller;

import com.patentsight.ai.dto.PatentIdRequest;
import com.patentsight.ai.dto.ValidationResultResponse;
import com.patentsight.ai.service.ValidationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ai")
public class AiValidationController {

    private final ValidationService validationService;

    public AiValidationController(ValidationService validationService) {
        this.validationService = validationService;
    }

    @PostMapping("/validations")
    public ResponseEntity<List<ValidationResultResponse>> validatePatentDocument(
            @RequestBody PatentIdRequest request) {
        return ResponseEntity.ok(validationService.validatePatent(request.getPatentId()));
    }
}
