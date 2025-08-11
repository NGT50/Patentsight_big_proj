package com.patentsight.ai.service.impl;

import com.patentsight.ai.client.ThreeDModelApiClient;
import com.patentsight.ai.dto.Generated3DModelResponse;
import com.patentsight.ai.dto.ImageIdRequest;
import com.patentsight.file.dto.FileResponse;
import com.patentsight.file.service.FileService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.multipart.MultipartFile;
import reactor.core.publisher.Mono;

import java.nio.file.Files;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AiImageServiceImplTest {

    @Mock
    private ThreeDModelApiClient apiClient;

    @Mock
    private FileService fileService;

    @InjectMocks
    private AiImageServiceImpl service;

    @Test
    void generate3DModelPersistsGltfFile() throws Exception {
        byte[] gltf = new byte[]{0x0, 0x1};
        Path tmp = Files.createTempFile("image-1", ".glb");
        Files.write(tmp, gltf);
        Path imagePath = Files.createTempFile("image", ".jpg");
        when(apiClient.generate(eq(imagePath), any())).thenReturn(Mono.just(tmp));

        FileResponse imageRes = new FileResponse();
        imageRes.setFileUrl(imagePath.toString());
        when(fileService.get(1L)).thenReturn(imageRes);

        FileResponse fileRes = new FileResponse();
        fileRes.setFileId(5L);
        fileRes.setFileUrl("path/model.glb");
        when(fileService.create(any(), isNull(), eq(123L))).thenReturn(fileRes);

        ImageIdRequest req = new ImageIdRequest();
        req.setImageId("1");
        req.setPatentId(123L);

        Generated3DModelResponse res = service.generate3DModel(req);

        assertEquals(5L, res.getFileId());
        assertEquals("path/model.glb", res.getFileUrl());

        ArgumentCaptor<MultipartFile> captor = ArgumentCaptor.forClass(MultipartFile.class);
        verify(fileService).create(captor.capture(), isNull(), eq(123L));
        MultipartFile saved = captor.getValue();
        assertTrue(saved.getOriginalFilename().endsWith(".glb"));
        assertEquals("model/gltf-binary", saved.getContentType());
        assertArrayEquals(gltf, saved.getBytes());
    }
}
