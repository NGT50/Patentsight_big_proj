package com.patentsight.ai.controller;

import com.patentsight.ai.dto.*;
import com.patentsight.ai.service.AiImageService;
import com.patentsight.file.dto.FileResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ai")
public class AiImageController {

    private final AiImageService aiImageService;

    public AiImageController(AiImageService aiImageService) {
        this.aiImageService = aiImageService;
    }

    @PostMapping("/image-similarities")
    public ResponseEntity<List<ImageSimilarityResponse>> analyzeImageSimilarity(
            @RequestBody ImageSimilarityRequest request) {
        List<ImageSimilarityResponse> response = aiImageService.analyzeImageSimilarity(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/3d-models")
    public ResponseEntity<Generated3DModelResponse> generate3DModel(
            @RequestBody ImageIdRequest request) {
        Generated3DModelResponse response = aiImageService.generate3DModel(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/3d-models/{id}")
    public ResponseEntity<FileResponse> getGenerated3DModel(@PathVariable("id") Long id) {
        FileResponse response = aiImageService.getGenerated3DModel(id);
        if (response == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(response);
    }
}
