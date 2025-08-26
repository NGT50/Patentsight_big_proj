package com.patentsight.file.controller;

import com.patentsight.config.JwtTokenProvider;
import com.patentsight.file.dto.FileResponse;
import com.patentsight.file.exception.S3UploadException;
import com.patentsight.file.service.FileService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.http.MediaTypeFactory;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.IOException;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileController {

    private final FileService fileService;
    private final JwtTokenProvider jwtTokenProvider;

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

    /** 기존 다운로드(attachment) — 그대로 보존 */
    @GetMapping("/{id}/content")
    public ResponseEntity<InputStreamResource> getContent(@PathVariable("id") Long id) {
        FileService.FileData data = fileService.loadContent(id);
        if (data == null) return ResponseEntity.notFound().build();

        String filename = data.getAttachment().getFileName();
        MediaType mediaType = MediaTypeFactory.getMediaType(filename)
                .orElse(MediaType.APPLICATION_OCTET_STREAM);

        InputStreamResource resource = new InputStreamResource(new ByteArrayInputStream(data.getBytes()));
        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .body(resource);
    }

    /** ✅ 유사 이미지용: inline 스트리밍 (프런트가 이 경로를 호출) */
    @GetMapping("/content/{id}/stream")          // 별칭 1 (프런트가 사용하는 경로)
    public ResponseEntity<Resource> streamAlias1(@PathVariable("id") Long id) throws IOException {
        return streamInternal(id);
    }

    /** ✅ 동일 자원에 대한 또 다른 별칭 (혹시 다른 코드가 이 포맷을 쓰고 있다면 대비) */
    @GetMapping("/{id}/content/stream")          // 별칭 2
    public ResponseEntity<Resource> streamAlias2(@PathVariable("id") Long id) throws IOException {
        return streamInternal(id);
    }

    private ResponseEntity<Resource> streamInternal(Long id) {
        FileService.FileData data = fileService.loadContent(id);
        if (data == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).build();

        String filename = data.getAttachment().getFileName();
        MediaType mediaType = MediaTypeFactory.getMediaType(filename)
                .orElse(MediaType.APPLICATION_OCTET_STREAM);

        InputStreamResource resource = new InputStreamResource(new ByteArrayInputStream(data.getBytes()));

        return ResponseEntity.ok()
                .contentType(mediaType)                         // image/png, image/jpeg 등
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "inline; filename=\"" + filename + "\"") // 👈 inline 으로 표시
                .cacheControl(CacheControl.noCache())            // 캐시 무효화(원하면 조정)
                .body(resource);
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
}
