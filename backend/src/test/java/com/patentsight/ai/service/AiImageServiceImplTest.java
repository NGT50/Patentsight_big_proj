package com.patentsight.ai.service;

import com.patentsight.ai.dto.ImageIdRequest;
import com.patentsight.ai.service.impl.AiImageServiceImpl;
import com.patentsight.ai.util.ThreeDModelApiClient;
import com.patentsight.file.domain.FileAttachment;
import com.patentsight.file.dto.FileResponse;
import com.patentsight.file.service.FileService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AiImageServiceImplTest {

    @Mock
    private FileService fileService;
    @Mock
    private ThreeDModelApiClient threeDModelApiClient;
    @InjectMocks
    private AiImageServiceImpl aiImageService;

    @BeforeEach
    void setup() {
        aiImageService = new AiImageServiceImpl(fileService, threeDModelApiClient);
    }

    @Test
    void generate3DModelPersistsGltfFile() throws Exception {
        ImageIdRequest req = new ImageIdRequest();
        req.setPatentId(1L);
        req.setImageId("10");

        File original = File.createTempFile("original", ".png");
        Files.writeString(original.toPath(), "img");
        FileAttachment img = new FileAttachment();
        img.setFileId(10L);
        img.setFileUrl(original.getAbsolutePath());
        when(fileService.findById(10L)).thenReturn(img);

        File glb = File.createTempFile("model", ".glb");
        Files.writeString(glb.toPath(), "glb");
        ArgumentCaptor<String> pathCaptor = ArgumentCaptor.forClass(String.class);
        when(threeDModelApiClient.generate(pathCaptor.capture())).thenReturn(glb);

        FileResponse saved = new FileResponse();
        saved.setFileId(42L);
        saved.setFileUrl("/uploads/42_generated.glb");
        when(fileService.create(any(MultipartFile.class), isNull(), eq(1L))).thenReturn(saved);

        aiImageService.generate3DModel(req);

        verify(fileService).create(any(MultipartFile.class), isNull(), eq(1L));

        Path usedPath = Path.of(pathCaptor.getValue());
        assertTrue(Files.exists(usedPath));
        assertNotEquals(original.toPath(), usedPath);

        glb.delete();
        original.delete();
    }
}
