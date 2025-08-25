package com.patentsight.ai.service.impl;

import com.patentsight.ai.util.ThreeDModelApiClient;
import com.patentsight.ai.dto.Generated3DModelResponse;
import com.patentsight.ai.dto.ImageIdRequest;
import com.patentsight.ai.service.AiImageService;
import com.patentsight.file.domain.FileAttachment;
import com.patentsight.file.dto.FileResponse;
import com.patentsight.file.service.FileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import com.patentsight.file.util.FileMultipartFile;

import java.io.File;

@Service
@RequiredArgsConstructor
public class AiImageServiceImpl implements AiImageService {

    private final FileService fileService;
    private final ThreeDModelApiClient threeDModelApiClient;

    @Override
    public Generated3DModelResponse generate3DModel(ImageIdRequest request) {
        FileAttachment image;
        try {
            image = fileService.findById(Long.parseLong(request.getImageId()));
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Original image not found");
        }

        File glbFile = threeDModelApiClient.generate(image.getFileUrl());
        if (glbFile == null || !glbFile.exists()) {
            throw new RuntimeException("Failed to generate 3D model");
        }

        MultipartFile multipartFile = new FileMultipartFile(glbFile, "model/gltf-binary");
        FileResponse saved = fileService.create(multipartFile, null, request.getPatentId());
        return new Generated3DModelResponse(saved.getFileId(), saved.getFileUrl());
    }
}
