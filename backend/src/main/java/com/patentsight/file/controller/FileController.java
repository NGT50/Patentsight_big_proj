package com.patentsight.file.controller;

import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.S3Object;
import com.patentsight.config.JwtTokenProvider;
import com.patentsight.file.dto.FileResponse;
import com.patentsight.file.exception.S3UploadException;
import com.patentsight.file.service.FileService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/api/files")
public class FileController {

    private final FileService fileService;
    private final JwtTokenProvider jwtTokenProvider;
    private final AmazonS3 s3;

    public FileController(FileService fileService,
                          JwtTokenProvider jwtTokenProvider,
                          AmazonS3 s3) {
        this.fileService = fileService;
        this.jwtTokenProvider = jwtTokenProvider;
        this.s3 = s3;
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
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ex.getMessage());
    }

    /** 이미지/파일 콘텐츠 스트리밍 (S3 전용) */
    @GetMapping("/{id}/content")
    public void stream(@PathVariable Long id, HttpServletResponse resp) throws IOException {
        var meta = fileService.getStorageMeta(id); // bucket, key, contentType, filename

        String contentType = (meta.contentType() != null) ? meta.contentType() : "application/octet-stream";
        resp.setContentType(contentType);

        String filename = (meta.filename() != null && !meta.filename().isBlank()) ? meta.filename() : "file";
        String encoded = URLEncoder.encode(filename, StandardCharsets.UTF_8).replace("+", "%20");
        resp.setHeader("Content-Disposition",
                "inline; filename=\"" + filename.replace("\"","'") + "\"; filename*=UTF-8''" + encoded);
        resp.setHeader("Cache-Control", "public, max-age=86400");

        try {
            S3Object obj = s3.getObject(meta.bucket(), meta.key());
            var s3Meta = obj.getObjectMetadata();
            if (s3Meta.getContentLength() > 0) {
                resp.setContentLengthLong(s3Meta.getContentLength());
            }
            if (s3Meta.getETag() != null) {
                resp.setHeader("ETag", s3Meta.getETag());
            }

            try (InputStream in = obj.getObjectContent(); OutputStream out = resp.getOutputStream()) {
                in.transferTo(out);
            }
        } catch (com.amazonaws.services.s3.model.AmazonS3Exception e) {
            // 상태코드에 따라 적절히 반환
            int sc = switch (e.getStatusCode()) {
                case 403 -> HttpServletResponse.SC_FORBIDDEN;
                case 404 -> HttpServletResponse.SC_NOT_FOUND;
                default -> HttpServletResponse.SC_BAD_GATEWAY;
            };
            resp.sendError(sc, "S3 error: " + e.getErrorCode());
        } catch (Exception e) {
            resp.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Streaming error");
        }
    }
}
