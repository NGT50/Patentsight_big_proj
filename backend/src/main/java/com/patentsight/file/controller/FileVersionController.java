package com.patentsight.file.controller;

import com.patentsight.file.dto.FileVersionInfoRequest;
import com.patentsight.file.dto.FileVersionResponse;
import com.patentsight.patent.service.PatentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class FileVersionController {
    private final PatentService patentService;

    public FileVersionController(PatentService patentService) {
        this.patentService = patentService;
    }

    @PatchMapping("/file-versions/{id}")
    public ResponseEntity<FileVersionResponse> updateVersionInfo(@PathVariable("id") Long id,
                                                                 @RequestBody FileVersionInfoRequest request) {
        FileVersionResponse res = patentService.updateVersionInfo(id, request);
        return ResponseEntity.ok(res);
    }

    @PostMapping("/file-versions/{id}/restore")
    public ResponseEntity<FileVersionResponse> restoreFileVersion(@PathVariable("id") Long id) {
        FileVersionResponse res = patentService.restoreFileVersion(id);
        return ResponseEntity.ok(res);
    }

    @DeleteMapping("/file-versions/{id}")
    public ResponseEntity<Map<String, Boolean>> deleteFileVersion(@PathVariable("id") Long id) {
        boolean deleted = patentService.deleteFileVersion(id);
        return ResponseEntity.ok(Map.of("deleted", deleted));
    }
}
