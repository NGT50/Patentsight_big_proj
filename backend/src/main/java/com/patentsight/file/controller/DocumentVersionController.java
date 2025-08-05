package com.patentsight.file.controller;

import com.patentsight.file.dto.FileVersionInfoRequest;
import com.patentsight.file.dto.FileVersionResponse;
import com.patentsight.file.dto.RestoreVersionResponse;
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
        return ResponseEntity.ok(res); // response now includes parent patentId
    }

    @PostMapping("/document-versions/{id}/restore")
    public ResponseEntity<RestoreVersionResponse> restoreDocumentVersion(@PathVariable("id") Long id) {
        RestoreVersionResponse res = patentService.restoreDocumentVersion(id);
        return ResponseEntity.ok(res);
    }

    @DeleteMapping("/document-versions/{id}")
    public ResponseEntity<Map<String, Boolean>> deleteDocumentVersion(@PathVariable("id") Long id) {
        boolean deleted = patentService.deleteDocumentVersion(id);
        return ResponseEntity.ok(Map.of("deleted", deleted));
    }
}
