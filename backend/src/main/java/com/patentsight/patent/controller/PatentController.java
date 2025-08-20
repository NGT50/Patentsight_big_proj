package com.patentsight.patent.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.patentsight.file.dto.DocumentContentResponse;
import com.patentsight.file.dto.DocumentVersionRequest;
import com.patentsight.file.dto.FileVersionResponse;
import com.patentsight.patent.domain.PatentStatus;
import com.patentsight.patent.dto.PatentRequest;
import com.patentsight.patent.dto.PatentResponse;
import com.patentsight.patent.dto.SubmitPatentResponse;
import com.patentsight.patent.service.PatentService;
import com.patentsight.config.JwtTokenProvider;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/patents")
public class PatentController {

    private final PatentService patentService;
    private final JwtTokenProvider jwtTokenProvider;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public PatentController(PatentService patentService, JwtTokenProvider jwtTokenProvider) {
        this.patentService = patentService;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    // ------------------- CREATE -------------------
    @PostMapping
    public ResponseEntity<PatentResponse> createPatent(@RequestBody PatentRequest request,
                                                       @RequestHeader("Authorization") String authorization) {
        Long userId = jwtTokenProvider.getUserIdFromHeader(authorization);
        PatentResponse response = patentService.createPatent(request, userId);
        return ResponseEntity.ok(response);
    }

    // ------------------- READ -------------------
    @GetMapping("/{id}")
    public ResponseEntity<PatentResponse> getPatent(@PathVariable("id") Long id) {
        PatentResponse res = patentService.getPatentDetail(id);
        return ResponseEntity.ok(res);
    }

    @GetMapping("/my")
    public ResponseEntity<List<PatentResponse>> getMyPatents(@RequestHeader("Authorization") String authorization) {
        Long userId = jwtTokenProvider.getUserIdFromHeader(authorization);
        List<PatentResponse> list = patentService.getMyPatents(userId);
        return ResponseEntity.ok(list);
    }

    // ------------------- SUBMIT -------------------
    // PatentController.java
    @PostMapping("/{id}/submit")
    public ResponseEntity<SubmitPatentResponse> submit(@PathVariable("id") Long id,
                                                       @RequestBody(required = false) PatentRequest latestRequest) {
        // 프론트에서 보낸 JSON이 PatentRequest 구조와 동일해야 함 (title, technicalField 등 최상단에 위치)
        SubmitPatentResponse res = patentService.submitPatent(id, latestRequest);
        return ResponseEntity.ok(res);
    }
    
    // ------------------- UPDATE -------------------
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

    @PatchMapping("/{id}/document")
    public ResponseEntity<DocumentContentResponse> updateDocumentContent(
            @PathVariable("id") Long id,
            @RequestBody Map<String, Object> body) {
    
        // 🔎 요청 바디 그대로 찍기
        System.out.println("Request Body: " + body);
    
        // 프론트에서 오는 { "documentData": {...} } 구조 풀기
        PatentRequest request = objectMapper.convertValue(body.get("documentData"), PatentRequest.class);
    
        // 🔎 변환된 DTO 찍기
        System.out.println("Converted PatentRequest: " + request);
    
        DocumentContentResponse res = patentService.updateDocument(id, request);
        return ResponseEntity.ok(res);
    }


    // ------------------- VERSION -------------------
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

    @PostMapping("/{id}/document-versions")
    public ResponseEntity<FileVersionResponse> createDocumentVersion(@PathVariable("id") Long id,
                                                                     @RequestBody DocumentVersionRequest request,
                                                                     @RequestHeader("Authorization") String authorization) {
        Long userId = jwtTokenProvider.getUserIdFromHeader(authorization);
        request.setApplicantId(userId);
        FileVersionResponse res = patentService.createDocumentVersion(id, request);
        return ResponseEntity.ok(res);
    }

    // ------------------- DELETE -------------------
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePatent(@PathVariable("id") Long id) {
        boolean deleted = patentService.deletePatent(id);
        if (deleted) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
