package com.patentsight.ai.controller;

import com.patentsight.ai.dto.AiCheckRequest;
import com.patentsight.ai.dto.AiCheckResponse;
import com.patentsight.ai.dto.AiCheckResultResponse;
import com.patentsight.ai.service.AiCheckService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai/checks")
public class AiCheckController {

    private final AiCheckService aiCheckService;

    public AiCheckController(AiCheckService aiCheckService) {
        this.aiCheckService = aiCheckService;
    }

    @PostMapping
    public ResponseEntity<AiCheckResponse> runAiCheck(@RequestBody AiCheckRequest request) {
        AiCheckResponse response = aiCheckService.runAiCheck(request.getPatentId());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/result/{checkId}")
    public ResponseEntity<AiCheckResultResponse> getAiCheckResult(@PathVariable String checkId) {
        AiCheckResultResponse response = aiCheckService.getAiCheckResult(checkId);
        return ResponseEntity.ok(response);
    }
}
