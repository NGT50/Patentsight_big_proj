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
    public ResponseEntity<DraftResponse> generateClaimDraft(@RequestBody ClaimDraftRequest request) {
        DraftResponse response = draftService.generateClaimDraft(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/rejections")
    public ResponseEntity<DraftResponse> generateRejectionDraft(@RequestBody PatentIdRequest request) {
        DraftResponse response = draftService.generateRejectionDraft(request.getPatentId());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{patentId}/drafts")
    public ResponseEntity<List<DraftListResponse>> listDrafts(@PathVariable Long patentId) {
        return ResponseEntity.ok(draftService.getDrafts(patentId));
    }

    @DeleteMapping("/{patentId}/drafts")
    public ResponseEntity<Void> deleteDrafts(@PathVariable Long patentId) {
        draftService.deleteDrafts(patentId);
        return ResponseEntity.noContent().build();
    }
}
