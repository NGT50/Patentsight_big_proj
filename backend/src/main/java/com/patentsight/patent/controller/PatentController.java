package com.patentsight.patent.controller;

import com.patentsight.file.dto.DocumentContentRequest;
import com.patentsight.file.dto.DocumentContentResponse;
import com.patentsight.file.dto.DocumentVersionRequest;
import com.patentsight.file.dto.FileVersionResponse;
import com.patentsight.patent.domain.PatentStatus;
import com.patentsight.patent.dto.PatentRequest;
import com.patentsight.patent.dto.PatentResponse;
import com.patentsight.patent.dto.SubmitPatentRequest;
import com.patentsight.patent.dto.SubmitPatentResponse; // 새로 추가된 DTO
import com.patentsight.patent.service.PatentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/patents")
public class PatentController {

    private final PatentService patentService;

    public PatentController(PatentService patentService) {
        this.patentService = patentService;
    }

    @PostMapping
    public ResponseEntity<PatentResponse> createPatent(@RequestBody PatentRequest request) {
        // applicantId should come from auth context; using dummy 1L for example
        PatentResponse response = patentService.createPatent(request, 1L);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PatentResponse> getPatent(@PathVariable("id") Long id) {
        PatentResponse res = patentService.getPatentDetail(id);
        return ResponseEntity.ok(res);
    }

    @GetMapping("/my")
    public ResponseEntity<List<PatentResponse>> getMyPatents() {
        List<PatentResponse> list = patentService.getMyPatents(1L);
        return ResponseEntity.ok(list);
    }

    @PostMapping("/{id}/submit")
    public ResponseEntity<SubmitPatentResponse> submit(@PathVariable("id") Long id,
                                                       @RequestBody(required = false) SubmitPatentRequest request) {
        SubmitPatentResponse res = patentService.submitPatent(id);
        return ResponseEntity.ok(res);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<PatentResponse> updateStatus(@PathVariable("id") Long id,
                                                       @RequestBody PatentStatus status) {
        PatentResponse res = patentService.updatePatentStatus(id, status);
        return ResponseEntity.ok(res);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PatentResponse> updatePatent(@PathVariable("id") Long id,
                                                       @RequestBody PatentRequest request) {
        PatentResponse res = patentService.updatePatent(id, request);
        return ResponseEntity.ok(res);
    }

    @GetMapping("/{id}/document-versions")
    public ResponseEntity<List<FileVersionResponse>> getDocumentVersions(@PathVariable("id") Long id) {
        List<FileVersionResponse> versions = patentService.getDocumentVersions(id);
        return ResponseEntity.ok(versions);
    }

    @GetMapping("/{id}/document/latest")
    public ResponseEntity<DocumentContentResponse> getLatestDocument(@PathVariable("id") Long id) {
        DocumentContentResponse res = patentService.getLatestDocument(id);
        return ResponseEntity.ok(res);
    }

    @PatchMapping("/{id}/document")
    public ResponseEntity<DocumentContentResponse> updateDocumentContent(@PathVariable("id") Long id,
                                                                         @RequestBody DocumentContentRequest request) {
        DocumentContentResponse res = patentService.updateDocument(id, request.getDocument());
        return ResponseEntity.ok(res);
    }

    @PostMapping("/{id}/document-versions")
    public ResponseEntity<FileVersionResponse> createDocumentVersion(@PathVariable("id") Long id,
                                                                     @RequestBody DocumentVersionRequest request) {
        FileVersionResponse res = patentService.createDocumentVersion(id, request);
        return ResponseEntity.ok(res);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePatent(@PathVariable("id") Long id) {
        boolean deleted = patentService.deletePatent(id);
        if (deleted) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}