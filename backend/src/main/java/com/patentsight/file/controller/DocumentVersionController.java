package com.patentsight.file.controller;

import com.patentsight.file.dto.FileVersionInfoRequest;
import com.patentsight.file.dto.FileVersionResponse;
import com.patentsight.patent.service.PatentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class DocumentVersionController {
    private final PatentService patentService;

    public DocumentVersionController(PatentService patentService) {
        this.patentService = patentService;
    }

    @PatchMapping("/document-versions/{id}")
    public ResponseEntity<FileVersionResponse> updateVersionInfo(@PathVariable("id") Long id,
                                                                 @RequestBody FileVersionInfoRequest request) {
        FileVersionResponse res = patentService.updateVersionInfo(id, request);
        return ResponseEntity.ok(res);
    }

    @PostMapping("/document-versions/{id}/restore")
    public ResponseEntity<FileVersionResponse> restoreDocumentVersion(@PathVariable("id") Long id) {
        FileVersionResponse res = patentService.restoreDocumentVersion(id);
        return ResponseEntity.ok(res);
    }

    @DeleteMapping("/document-versions/{id}")
    public ResponseEntity<Map<String, Boolean>> deleteDocumentVersion(@PathVariable("id") Long id) {
        boolean deleted = patentService.deleteDocumentVersion(id);
        return ResponseEntity.ok(Map.of("deleted", deleted));
    }
}
