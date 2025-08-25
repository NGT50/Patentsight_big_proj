package com.patentsight.file.controller;

import com.patentsight.config.JwtTokenProvider;
import com.patentsight.file.dto.FileResponse;
import com.patentsight.file.exception.S3UploadException;
import com.patentsight.file.service.FileService;
import com.patentsight.global.util.FileUtil;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Duration;

@RestController
@RequestMapping("/api/files")
public class FileController {

    private static final Logger log = LoggerFactory.getLogger(FileController.class);

    private final FileService fileService;
    private final JwtTokenProvider jwtTokenProvider;

    // 프리사인용
    private final S3Presigner s3Presigner;
    private final String bucket;

    public FileController(
            FileService fileService,
            JwtTokenProvider jwtTokenProvider,
            S3Presigner s3Presigner,
            @Value("${aws.s3.bucket}") String bucket
    ) {
        this.fileService = fileService;
        this.jwtTokenProvider = jwtTokenProvider;
        this.s3Presigner = s3Presigner;
        this.bucket = bucket;
    }

    /* ========================= CRUD ========================= */

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
        if (res == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(res);
    }

    @PutMapping("/{id}")
    public ResponseEntity<FileResponse> update(@PathVariable("id") Long id,
                                               @RequestParam("file") MultipartFile file) {
        FileResponse res = fileService.update(id, file);
        if (res == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(res);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") Long id) {
        boolean deleted = fileService.delete(id);
        if (deleted) return ResponseEntity.noContent().build();
        return ResponseEntity.notFound().build();
    }

    @ExceptionHandler(S3UploadException.class)
    public ResponseEntity<String> handleS3UploadException(S3UploadException ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ex.getMessage());
    }

    /* ============ 공개 콘텐츠: 절대 URL로 302 리다이렉트 ============ */

    /** 파일 ID 기반 공개 보기 (이미지 <img>, fetch 폴백 모두 OK) */
    @GetMapping("/{id}/content")
    public void redirectById(@PathVariable Long id, HttpServletResponse resp) throws IOException {
        var meta = fileService.getStorageMeta(id); // key, filename, contentType

        // 1) FileUtil로 공개 URL 시도 (로컬/정적 경로 or 이미 퍼블릭 URL일 수 있음)
        String publicUrl = FileUtil.getPublicUrl(meta.key());

        // 2) 퍼블릭 URL이 없거나 S3 키처럼 보이면 프리사인 생성
        if (isBlank(publicUrl) || looksLikeS3Key(publicUrl)) {
            publicUrl = presign(meta.key(), meta.filename(), meta.contentType());
        }

        // 3) 절대 URL 보장
        if (publicUrl.startsWith("/")) {
            publicUrl = absoluteBackendUrl(publicUrl);
        }

        resp.setStatus(HttpServletResponse.SC_FOUND); // 302
        resp.setHeader("Location", publicUrl);
    }

    /**
     * 특허ID + 파일명 기반 공개 보기.
     * 파일명이 점(.) 포함되므로 .+ 패턴으로 매칭.
     * DB 미스여도 /files/{patentId}/{fileName}로 폴백(절대 URL) → 400 방지
     */
    @GetMapping("/{patentId}/{fileName:.+}")
    public void redirectByPatentAndName(@PathVariable Long patentId,
                                        @PathVariable String fileName,
                                        HttpServletResponse resp) throws IOException {
        String publicUrl;
        try {
            var attach = fileService.findByPatentIdAndFileName(patentId, fileName);
            String key = attach.getFileUrl();
            // 1) FileUtil 공개 URL 시도
            publicUrl = FileUtil.getPublicUrl(key);
            // 2) 없거나 S3 키처럼 보이면 프리사인
            if (isBlank(publicUrl) || looksLikeS3Key(publicUrl)) {
                publicUrl = presign(key, fileName, guessContentTypeSafe(fileName));
            }
        } catch (IllegalArgumentException notFound) {
            // ✅ DB에 없어도 정적 경로로 폴백 (예: /files/{patentId}/{fileName})
            String encoded = URLEncoder.encode(fileName, StandardCharsets.UTF_8);
            publicUrl = "/files/" + patentId + "/" + encoded;
        }

        // 절대 URL 보장
        if (publicUrl.startsWith("/")) {
            publicUrl = absoluteBackendUrl(publicUrl);
        }

        resp.setStatus(HttpServletResponse.SC_FOUND); // 302
        resp.setHeader("Location", publicUrl);
    }

    /* ========================= 내부 유틸 ========================= */

    private String presign(String key, String filename, String contentType) {
        String safeName = URLEncoder.encode(filename == null ? "file" : filename, StandardCharsets.UTF_8);

        GetObjectRequest get = GetObjectRequest.builder()
                .bucket(bucket)
                .key(key)
                .responseContentType(contentType)
                .responseContentDisposition("inline; filename*=UTF-8''" + safeName)
                .build();

        return s3Presigner.presignGetObject(b -> b
                        .signatureDuration(Duration.ofMinutes(10))
                        .getObjectRequest(get))
                .url()
                .toString();
    }

    private static boolean looksLikeS3Key(String value) {
        if (isBlank(value)) return true;
        String v = value.trim().toLowerCase();
        // http(s)면 이미 퍼블릭 URL
        if (v.startsWith("http://") || v.startsWith("https://")) return false;
        // 슬래시로 시작하면 정적 경로(/files/...)로 간주
        if (v.startsWith("/")) return false;
        // 그 외는 S3 키일 가능성 높음
        return true;
    }

    private static boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }

    private static String absoluteBackendUrl(String path) {
        String base = ServletUriComponentsBuilder.fromCurrentContextPath()
                .build().toUriString(); // 예: http://localhost:8080
        if (!path.startsWith("/")) path = "/" + path;
        return base + path;
    }

    private String guessContentTypeSafe(String filename) {
        if (filename == null) return "application/octet-stream";
        String ext = filename.contains(".") ? filename.substring(filename.lastIndexOf('.') + 1).toLowerCase() : "";
        return switch (ext) {
            case "png" -> "image/png";
            case "jpg", "jpeg" -> "image/jpeg";
            case "gif" -> "image/gif";
            case "bmp" -> "image/bmp";
            case "webp" -> "image/webp";
            case "svg" -> "image/svg+xml";
            case "pdf" -> "application/pdf";
            case "glb" -> "model/gltf-binary";
            default -> "application/octet-stream";
        };
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleIllegalArgument(IllegalArgumentException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ex.getMessage());
    }
}
