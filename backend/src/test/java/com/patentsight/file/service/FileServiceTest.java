package com.patentsight.file.service;

import com.patentsight.file.domain.FileAttachment;
import com.patentsight.file.dto.FileResponse;
import com.patentsight.file.repository.FileRepository;
import com.patentsight.global.util.FileUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FileServiceTest {

    @Mock
    private FileRepository fileRepository;

    @InjectMocks
    private FileService fileService;

    @BeforeEach
    void setup() {
        fileService = new FileService(fileRepository);
    }

    @Test
    void createStoresFileAndReturnsMetadata() throws Exception {
        MockMultipartFile multipartFile = new MockMultipartFile(
                "file", "hello.txt", "text/plain", "hello".getBytes());

        when(fileRepository.save(any(FileAttachment.class))).thenAnswer(invocation -> {
            FileAttachment att = invocation.getArgument(0);
            att.setFileId(1L);
            return att;
        });

        FileResponse res = fileService.create(multipartFile, 99L);

        assertNotNull(res);
        assertEquals(1L, res.getFileId());
        assertEquals(99L, res.getUploaderId());
        assertEquals("hello.txt", res.getFileName());
        assertNotNull(res.getFileUrl());
        verify(fileRepository).save(any(FileAttachment.class));

        // cleanup saved file
        FileUtil.deleteFile(res.getFileUrl());
    }
}

