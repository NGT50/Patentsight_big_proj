package com.patentsight.ai.service.impl;

import com.patentsight.ai.client.ThreeDModelApiClient;
import com.patentsight.ai.dto.*;
import com.patentsight.ai.service.AiImageService;
import com.patentsight.file.dto.FileResponse;
import com.patentsight.file.service.FileService;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Mono;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AiImageServiceImpl implements AiImageService {

    private final ThreeDModelApiClient threeDModelApiClient;
    private final FileService fileService;

    public AiImageServiceImpl(ThreeDModelApiClient threeDModelApiClient, FileService fileService) {
        this.threeDModelApiClient = threeDModelApiClient;
        this.fileService = fileService;
    }

    @Override
    public List<ImageSimilarityResponse> analyzeImageSimilarity(ImageSimilarityRequest request) {
        return request.getImageIds().stream()
                .map(id -> new ImageSimilarityResponse(id, Math.random()))
                .collect(Collectors.toList());
    }

    @Override
    public Generated3DModelResponse generate3DModel(ImageIdRequest request) {
        FileResponse image = fileService.get(Long.valueOf(request.getImageId()));
        if (image == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Image not found: " + request.getImageId());
        }
        Path imagePath = Paths.get(image.getFileUrl());
        Mono<Path> mono = threeDModelApiClient.generate(
                imagePath,
                Paths.get("uploads"));
        Path glbPath = mono.block();
        if (glbPath == null) {
            throw new RuntimeException("Failed to generate 3D model");
        }

        try (InputStream is = Files.newInputStream(glbPath)) {
            MockMultipartFile gltfFile = new MockMultipartFile(
                    "file",
                    glbPath.getFileName().toString(),
                    "model/gltf-binary",
                    is
            );

            FileResponse saved = fileService.create(gltfFile, null, request.getPatentId());
            return new Generated3DModelResponse(saved.getFileId(), saved.getFileUrl());
        } catch (IOException e) {
            throw new RuntimeException("Failed to read generated model", e);
        }
    }
}
