package com.patentsight.ai.controller;

import com.patentsight.ai.dto.Generated3DModelResponse;
import com.patentsight.ai.dto.ImageIdRequest;
import com.patentsight.ai.service.AiImageService;
import com.patentsight.file.dto.FileResponse;
import com.patentsight.file.service.FileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiImageController {

    private final AiImageService aiImageService;
    private final FileService fileService;

    @PostMapping("/3d-models")
    public Generated3DModelResponse generate3DModel(@RequestBody ImageIdRequest request) {
        return aiImageService.generate3DModel(request);
    }

    @GetMapping("/3d-models/{id}")
    public ResponseEntity<FileResponse> getGenerated3DModel(@PathVariable Long id) {
        FileResponse res = fileService.get(id);
        if (res == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(res);
    }
}
