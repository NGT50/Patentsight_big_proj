package com.patentsight.file.service;

import com.patentsight.file.domain.FileAttachment;
import com.patentsight.file.domain.FileType;
import com.patentsight.file.dto.FileResponse;
import com.patentsight.file.exception.S3UploadException;
import com.patentsight.file.repository.FileRepository;
import com.patentsight.global.util.FileUtil;
import com.patentsight.patent.domain.Patent;
import com.patentsight.patent.repository.PatentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import org.mockito.MockedStatic;
import java.io.IOException;

@ExtendWith(MockitoExtension.class)
class FileServiceTest {

    @Mock
    private FileRepository fileRepository;

    @InjectMocks
    private FileService fileService;

    @Mock
    private PatentRepository patentRepository;

    @BeforeEach
    void setup() {
        fileService = new FileService(fileRepository, patentRepository);
    }

    @Test
    void createStoresFileAndReturnsMetadata() throws Exception {
        MockMultipartFile multipartFile = new MockMultipartFile(
                "file", "hello.pdf", "application/pdf", "hello".getBytes());

        when(fileRepository.save(any(FileAttachment.class))).thenAnswer(invocation -> {
            FileAttachment att = invocation.getArgument(0);
            att.setFileId(1L);
            return att;
        });

        Patent patent = new Patent();
        patent.setPatentId(10L);
        when(patentRepository.findById(10L)).thenReturn(java.util.Optional.of(patent));

        try (MockedStatic<FileUtil> mocked = mockStatic(FileUtil.class)) {
            mocked.when(() -> FileUtil.saveFile(any(MultipartFile.class))).thenReturn("stored/hello.pdf");
            mocked.when(() -> FileUtil.getPublicUrl("stored/hello.pdf")).thenReturn("https://example.com/stored/hello.pdf");
            mocked.when(() -> FileUtil.deleteFile(anyString())).thenAnswer(invocation -> null);

            FileResponse res = fileService.create(multipartFile, 99L, 10L);

            assertNotNull(res);
            assertEquals(1L, res.getFileId());
            assertEquals(99L, res.getUploaderId());
            assertEquals(10L, res.getPatentId());
            assertEquals("hello.pdf", res.getFileName());
            assertEquals(FileType.PDF, res.getFileType());
            assertEquals("https://example.com/stored/hello.pdf", res.getFileUrl());
            verify(fileRepository).save(any(FileAttachment.class));

            // cleanup saved file
            FileUtil.deleteFile(res.getFileUrl());
        }
    }

    @Test
    void createThrowsWhenLocalPathReturned() throws Exception {
        MockMultipartFile multipartFile = new MockMultipartFile(
                "file", "img.png", "image/png", "data".getBytes());

        Patent patent = new Patent();
        patent.setPatentId(10L);
        when(patentRepository.findById(10L)).thenReturn(java.util.Optional.of(patent));

        try (MockedStatic<FileUtil> mocked = mockStatic(FileUtil.class)) {
            mocked.when(() -> FileUtil.saveFile(any(MultipartFile.class))).thenReturn("/tmp/img.png");
            S3UploadException ex = assertThrows(S3UploadException.class,
                    () -> fileService.create(multipartFile, 1L, 10L));
            assertTrue(ex.getMessage().contains("file saved locally"));
        }
    }

    @Test
    void createPropagatesS3FailureMessage() throws Exception {
        MockMultipartFile multipartFile = new MockMultipartFile(
                "file", "img.png", "image/png", "data".getBytes());

        Patent patent = new Patent();
        patent.setPatentId(10L);
        when(patentRepository.findById(10L)).thenReturn(java.util.Optional.of(patent));

        try (MockedStatic<FileUtil> mocked = mockStatic(FileUtil.class)) {
            mocked.when(() -> FileUtil.saveFile(any(MultipartFile.class)))
                    .thenThrow(new IOException("AccessDenied"));
            S3UploadException ex = assertThrows(S3UploadException.class,
                    () -> fileService.create(multipartFile, 1L, 10L));
            assertTrue(ex.getMessage().contains("AccessDenied"));
        }
    }
}

