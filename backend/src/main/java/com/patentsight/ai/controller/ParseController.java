package com.patentsight.ai.controller;

import com.patentsight.ai.dto.ParsePdfResponse;
import com.patentsight.ai.service.ParseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class ParseController {

    private final ParseService parseService;

    /**
     * PDF 업로드 → 내부에서 파싱 → JSON 반환
     */
    @PostMapping(value = "/parse-pdf", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ParsePdfResponse> parsePdf(@RequestPart("file") MultipartFile file) {
        return ResponseEntity.ok(parseService.parsePdf(file));
    }
}
