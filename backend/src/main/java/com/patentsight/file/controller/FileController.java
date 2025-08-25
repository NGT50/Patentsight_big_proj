package com.patentsight.file.controller;

import com.patentsight.config.JwtTokenProvider;
import com.patentsight.file.dto.FileResponse;
import com.patentsight.file.exception.S3UploadException;
import com.patentsight.file.service.FileService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/files")
public class FileController {

    private static final Logger log = LoggerFactory.getLogger(FileController.class);

    private final FileService fileService;
    private final JwtTokenProvider jwtTokenProvider;

    public FileController(FileService fileService, JwtTokenProvider jwtTokenProvider) {
        this.fileService = fileService;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @PostMapping
    public ResponseEntity<FileResponse> upload(@RequestParam("file") MultipartFile file,
                                               @RequestParam Long patentId,
                                               @RequestHeader("Authorization") String authorization) {
        Long userId = jwtTokenProvider.getUserIdFromHeader(authorization);
        FileResponse res = fileService.create(file, userId, patentId);
        return ResponseEntity.ok(res);
    }

    @GetMapping("/{id}")
    public ResponseEntity<FileResponse> get(@PathVariable("id") Long id) {
        FileResponse res = fileService.get(id);
        if (res == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(res);
    }

    @PutMapping("/{id}")
    public ResponseEntity<FileResponse> update(@PathVariable("id") Long id,
                                               @RequestParam("file") MultipartFile file) {
        FileResponse res = fileService.update(id, file);
        if (res == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(res);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") Long id) {
        boolean deleted = fileService.delete(id);
        if (deleted) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @ExceptionHandler(S3UploadException.class)
    public ResponseEntity<String> handleS3UploadException(S3UploadException ex) {
        log.error("S3 upload error: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ex.getMessage());
    }
}

