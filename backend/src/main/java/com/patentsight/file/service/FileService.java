package com.patentsight.file.service;

import com.patentsight.file.domain.FileAttachment;
import com.patentsight.file.domain.FileType;
import com.patentsight.file.dto.FileResponse;
import com.patentsight.file.exception.S3UploadException;
import com.patentsight.file.repository.FileRepository;
import com.patentsight.patent.domain.Patent;
import com.patentsight.patent.repository.PatentRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.time.LocalDateTime;

@Service
@Transactional
public class FileService {

    private final FileRepository fileRepository;
    private final PatentRepository patentRepository;

    // ✅ application.yml (혹은 properties)에서 주입
    // aws:
    //   s3:
    //     bucket: patentsight-artifacts-usea1
    @Value("${aws.s3.bucket}")
    private String s3Bucket;

    public FileService(FileRepository fileRepository, PatentRepository patentRepository) {
        this.fileRepository = fileRepository;
        this.patentRepository = patentRepository;
    }

    /**
     * 지금은 기존 로컬 저장 로직을 유지합니다.
     * (S3 업로드로 바꾸실 땐, putObject 후 objectKey를 file_url에 저장만 하시면 됩니다.)
     */
    public FileResponse create(MultipartFile file, Long uploaderId, Long patentId) {
        try {
            // 현재 로컬 저장. S3 업로드로 전환할 땐 여기를 교체.
            String path = com.patentsight.global.util.FileUtil.saveFile(file);

            FileAttachment attachment = new FileAttachment();
            attachment.setUploaderId(uploaderId);
            attachment.setFileName(file.getOriginalFilename());
            attachment.setFileUrl(path); // ★ S3 전환 시: objectKey를 넣으세요.
            attachment.setFileType(determineFileType(file.getOriginalFilename()));
            attachment.setUpdatedAt(LocalDateTime.now());

            Patent patent = patentRepository.findById(patentId)
                    .orElseThrow(() -> new IllegalArgumentException("Patent not found"));
            attachment.setPatent(patent);

            fileRepository.save(attachment);
            return toResponse(attachment);
        } catch (IOException e) {
            throw new S3UploadException("Could not store file: " + e.getMessage(), e);
        }
    }

    public FileResponse get(Long id) {
        return fileRepository.findById(id).map(this::toResponse).orElse(null);
    }

    /**
     * Replaces the physical file and updates metadata.
     */
    public FileResponse update(Long id, MultipartFile file) {
        FileAttachment attachment = fileRepository.findById(id).orElse(null);
        if (attachment == null) return null;
        try {
            com.patentsight.global.util.FileUtil.deleteFile(attachment.getFileUrl());
            String path = com.patentsight.global.util.FileUtil.saveFile(file);
            attachment.setFileName(file.getOriginalFilename());
            attachment.setFileUrl(path); // ★ S3 전환 시: objectKey를 넣으세요.
            attachment.setFileType(determineFileType(file.getOriginalFilename()));
            attachment.setUpdatedAt(LocalDateTime.now());
            fileRepository.save(attachment);
            return toResponse(attachment);
        } catch (IOException e) {
            throw new S3UploadException("Could not update file: " + e.getMessage(), e);
        }
    }

    public boolean delete(Long id) {
        FileAttachment attachment = fileRepository.findById(id).orElse(null);
        if (attachment == null) return false;
        try {
            com.patentsight.global.util.FileUtil.deleteFile(attachment.getFileUrl());
        } catch (IOException ignored) {
        }
        fileRepository.delete(attachment);
        return true;
    }

    private FileResponse toResponse(FileAttachment attachment) {
        FileResponse res = new FileResponse();
        res.setFileId(attachment.getFileId());
        res.setPatentId(attachment.getPatent() != null ? attachment.getPatent().getPatentId() : null);
        res.setUploaderId(attachment.getUploaderId());
        res.setFileName(attachment.getFileName());
        res.setFileUrl(attachment.getFileUrl());
        res.setFileType(attachment.getFileType());
        res.setContent(attachment.getContent());
        res.setUpdatedAt(attachment.getUpdatedAt());
        return res;
    }

    private FileType determineFileType(String name) {
        if (name == null) return null;
        String ext = name.contains(".") ? name.substring(name.lastIndexOf('.') + 1).toLowerCase() : "";
        return switch (ext) {
            case "png", "jpg", "jpeg", "gif", "bmp" -> FileType.IMAGE;
            case "glb" -> FileType.GLB;
            case "pdf" -> FileType.PDF;
            default -> null;
        };
    }

    public FileAttachment findById(Long id) {
        return fileRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("File not found: " + id));
    }

    // ---------- ⬇️ 여기부터 S3 스트리밍용 메타 제공 ----------

    /** 컨트롤러에서 사용할 메타 DTO */
    public record StorageMeta(String bucket, String key, String contentType, String filename) {}

    /** 스키마 변경 없이: file_url을 objectKey로 사용.
     *  단, file_url이 'https://...amazonaws.com/...' 전체 URL이면 key만 파싱해서 반환.
     */
    public StorageMeta getStorageMeta(Long id) {
        var f = fileRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("file not found: " + id));

        String filename = (f.getFileName() != null && !f.getFileName().isBlank()) ? f.getFileName() : "file";
        String contentType = guessContentType(filename);

        String urlOrKey = f.getFileUrl();
        if (urlOrKey == null || urlOrKey.isBlank()) {
            throw new IllegalStateException("fileUrl is null/blank for file " + id);
        }

        String key = extractS3Key(urlOrKey); // 전체 URL이든, 키이든 전부 대응
        return new StorageMeta(s3Bucket, key, contentType, filename);
    }

    private String extractS3Key(String urlOrKey) {
        // 이미 키 형태라면 그대로 반환
        if (!(urlOrKey.startsWith("http://") || urlOrKey.startsWith("https://"))) {
            return urlOrKey;
        }
        // 전체 S3 URL에서 key만 파싱
        try {
            URI u = new URI(urlOrKey);
            String host = u.getHost();  // {bucket}.s3.amazonaws.com or {bucket}.s3.region.amazonaws.com
            String path = u.getPath();  // "/key/with/segments"
            if (host == null || !host.contains(".s3") || path == null || path.isBlank()) {
                // 예상치 못한 형태면 그냥 원문 반환 (최후방어)
                return urlOrKey;
            }
            return path.startsWith("/") ? path.substring(1) : path;
        } catch (URISyntaxException e) {
            // 파싱 실패 시에도 원문 반환
            return urlOrKey;
        }
    }

    private String guessContentType(String filename) {
        String n = filename.toLowerCase();
        if (n.endsWith(".png")) return "image/png";
        if (n.endsWith(".jpg") || n.endsWith(".jpeg")) return "image/jpeg";
        if (n.endsWith(".gif")) return "image/gif";
        if (n.endsWith(".bmp")) return "image/bmp";
        if (n.endsWith(".pdf")) return "application/pdf";
        if (n.endsWith(".glb")) return "model/gltf-binary";
        return "application/octet-stream";
    }
}
