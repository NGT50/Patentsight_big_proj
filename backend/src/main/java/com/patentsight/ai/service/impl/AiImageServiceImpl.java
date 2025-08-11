package com.patentsight.ai.service.impl;

import com.patentsight.ai.client.ThreeDModelApiClient;
import com.patentsight.ai.domain.Generated3DModel;
import com.patentsight.ai.dto.*;
import com.patentsight.ai.repository.Generated3DModelRepository;
import com.patentsight.ai.service.AiImageService;
import com.patentsight.file.domain.FileAttachment;
import com.patentsight.file.dto.FileResponse;
import com.patentsight.file.repository.FileRepository;
import com.patentsight.file.service.FileService;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AiImageServiceImpl implements AiImageService {

    private final ThreeDModelApiClient threeDModelApiClient;
    private final FileService fileService;
    private final FileRepository fileRepository;
    private final Generated3DModelRepository generated3DModelRepository;

    public AiImageServiceImpl(ThreeDModelApiClient threeDModelApiClient,
                              FileService fileService,
                              FileRepository fileRepository,
                              Generated3DModelRepository generated3DModelRepository) {
        this.threeDModelApiClient = threeDModelApiClient;
        this.fileService = fileService;
        this.fileRepository = fileRepository;
        this.generated3DModelRepository = generated3DModelRepository;
    }

    @Override
    public List<ImageSimilarityResponse> analyzeImageSimilarity(ImageSimilarityRequest request) {
        return request.getImageIds().stream()
                .map(id -> new ImageSimilarityResponse(id, Math.random()))
                .collect(Collectors.toList());
    }

    @Override
    public Generated3DModelResponse generate3DModel(ImageIdRequest request) {
        Long fileId = request.getImageId();
        FileResponse fileResponse = fileService.get(fileId);
        if (fileResponse == null) {
            throw new IllegalArgumentException("File not found");
        }
        Path path = Paths.get(fileResponse.getFileUrl());
        Mono<Generate3DModelApiResponse> mono = threeDModelApiClient.generate(path);
        Generate3DModelApiResponse apiResponse = mono.block();

        FileAttachment attachment = fileRepository.findById(fileId)
                .orElseThrow(() -> new IllegalArgumentException("File not found"));

        FileAttachment generatedAttachment = new FileAttachment();
        generatedAttachment.setUploaderId(attachment.getUploaderId());
        generatedAttachment.setFileName(Paths.get(apiResponse.getFilePath()).getFileName().toString());
        generatedAttachment.setFileUrl(apiResponse.getFilePath());
        generatedAttachment.setUpdatedAt(LocalDateTime.now());
        generatedAttachment.setPatent(attachment.getPatent());
        fileRepository.save(generatedAttachment);

        Generated3DModel model = new Generated3DModel();
        model.setResultId(apiResponse.getResultId());
        model.setGeneratedFile(generatedAttachment);
        model.setSourceFile(attachment);
        generated3DModelRepository.save(model);

        return new Generated3DModelResponse(model.getId(), model.getResultId(),
                generatedAttachment.getFileId(), generatedAttachment.getFileUrl());
    }

    @Override
    public Generated3DModelResponse getGenerated3DModel(Long id) {
        Optional<Generated3DModel> model = generated3DModelRepository.findById(id);
        return model.map(m -> new Generated3DModelResponse(
                m.getId(),
                m.getResultId(),
                m.getGeneratedFile().getFileId(),
                m.getGeneratedFile().getFileUrl()))
                .orElse(null);
    }

    @Override
    public boolean deleteGenerated3DModel(Long id) {
        Optional<Generated3DModel> modelOpt = generated3DModelRepository.findById(id);
        if (modelOpt.isEmpty()) {
            return false;
        }
        Generated3DModel model = modelOpt.get();
        FileAttachment generated = model.getGeneratedFile();
        if (generated != null) {
            fileService.delete(generated.getFileId());
        }
        generated3DModelRepository.delete(model);
        return true;
    }
}
