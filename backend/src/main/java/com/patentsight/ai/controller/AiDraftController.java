package com.patentsight.ai.controller;

import com.patentsight.ai.dto.*;
import com.patentsight.ai.service.DraftService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ai/drafts")
public class AiDraftController {

    private final DraftService draftService;

    @Autowired
    public AiDraftController(DraftService draftService) {
        this.draftService = draftService;
    }

    @PostMapping("/claims")
    public ResponseEntity<DraftResponse> generateClaimDraft(@RequestBody PatentIdRequest request) {
        DraftResponse response = draftService.generateClaimDraft(request.getPatentId());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/rejections")
    public ResponseEntity<DraftResponse> generateRejectionDraft(@RequestBody PatentIdRequest request) {
        DraftResponse response = draftService.generateRejectionDraft(request.getPatentId());
        return ResponseEntity.ok(response);
    }

    // 수정된 부분: @RequestParam 대신 @PathVariable을 사용하도록 변경
    @GetMapping("/{patentId}/drafts")
    public ResponseEntity<List<DraftListResponse>> listDrafts(@PathVariable Long patentId) {
        return ResponseEntity.ok(draftService.getDrafts(patentId));
    }

    // 수정된 부분: @RequestParam 대신 @PathVariable을 사용하도록 변경
    @DeleteMapping("/{patentId}/drafts")
    public ResponseEntity<Void> deleteDrafts(@PathVariable Long patentId) {
        draftService.deleteDrafts(patentId);
        return ResponseEntity.noContent().build();
    }
}