package com.patentsight.ai.controller;

import com.patentsight.ai.dto.*;
import com.patentsight.ai.service.AiImageService;
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
    public ResponseEntity<Generated3DModelResponse> get3DModel(@PathVariable Long id) {
        Generated3DModelResponse response = aiImageService.getGenerated3DModel(id);
        return response != null ? ResponseEntity.ok(response) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/3d-models/{id}")
    public ResponseEntity<Void> delete3DModel(@PathVariable Long id) {
        boolean deleted = aiImageService.deleteGenerated3DModel(id);
        return deleted ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }
}
