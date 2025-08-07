package com.patentsight.file.controller;

import com.patentsight.config.JwtTokenProvider;
import com.patentsight.file.dto.FileResponse;
import com.patentsight.file.service.FileService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/files")
public class FileController {

    private final FileService fileService;
    private final JwtTokenProvider jwtTokenProvider;

    public FileController(FileService fileService, JwtTokenProvider jwtTokenProvider) {
        this.fileService = fileService;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @PostMapping
    public ResponseEntity<FileResponse> upload(@RequestParam("file") MultipartFile file,
                                               @RequestHeader("Authorization") String authorization) {
        Long userId = jwtTokenProvider.getUserIdFromHeader(authorization);
        FileResponse res = fileService.create(file, userId);
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
}

