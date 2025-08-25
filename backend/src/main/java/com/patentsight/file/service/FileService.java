package com.patentsight.file.service;

import com.patentsight.file.domain.FileAttachment;
import com.patentsight.file.dto.FileResponse;
import com.patentsight.file.domain.FileType;
import com.patentsight.file.exception.S3UploadException;
import com.patentsight.file.repository.FileRepository;
import com.patentsight.global.util.FileUtil;
import com.patentsight.patent.domain.Patent;
import com.patentsight.patent.repository.PatentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
// ✅ Optional 안 쓸 거면 import 불필요 (쓴다면 import java.util.Optional;)

@Service
@Transactional
public class FileService {

    private static final Logger log = LoggerFactory.getLogger(FileService.class);

    private final FileRepository fileRepository;
    private final PatentRepository patentRepository;

    public FileService(FileRepository fileRepository, PatentRepository patentRepository) {
        this.fileRepository = fileRepository;
        this.patentRepository = patentRepository;
    }

    public FileResponse create(MultipartFile file, Long uploaderId, Long patentId) {
        try {
            FileType fileType = determineFileType(file.getOriginalFilename());
            if (fileType == null) {
                throw new IllegalArgumentException("Unsupported file type");
            }
            String path = FileUtil.saveFile(file);
            FileAttachment attachment = new FileAttachment();
            attachment.setUploaderId(uploaderId);
            attachment.setFileName(file.getOriginalFilename());
            attachment.setFileUrl(path); // DB에는 키/상대경로 저장
            attachment.setFileType(determineFileType(file.getOriginalFilename()));
            attachment.setUpdatedAt(LocalDateTime.now());

            Patent patent = patentRepository.findById(patentId)
                    .orElseThrow(() -> new IllegalArgumentException("Patent not found"));
            attachment.setPatent(patent);

            fileRepository.save(attachment);
            return toResponse(attachment);
        } catch (IOException e) {
            log.error("Could not store file on S3", e);
            throw new S3UploadException("Could not store file on S3: " + e.getMessage(), e);
        }
    }

    public FileResponse get(Long id) {
        return fileRepository.findById(id).map(this::toResponse).orElse(null);
    }

    public FileResponse update(Long id, MultipartFile file) {
        FileAttachment attachment = fileRepository.findById(id).orElse(null);
        if (attachment == null) return null;
        try {
            FileType fileType = determineFileType(file.getOriginalFilename());
            if (fileType == null) {
                throw new IllegalArgumentException("Unsupported file type");
            }
            FileUtil.deleteFile(attachment.getFileUrl());
            String path = FileUtil.saveFile(file);
            attachment.setFileName(file.getOriginalFilename());
            attachment.setFileUrl(path);
            attachment.setFileType(fileType);
            attachment.setUpdatedAt(LocalDateTime.now());
            fileRepository.save(attachment);
            return toResponse(attachment);
        } catch (IOException e) {
            log.error("Could not update file on S3", e);
            throw new S3UploadException("Could not update file on S3: " + e.getMessage(), e);
        }
    }

    public boolean delete(Long id) {
        FileAttachment attachment = fileRepository.findById(id).orElse(null);
        if (attachment == null) return false;
        try {
            FileUtil.deleteFile(attachment.getFileUrl());
        } catch (IOException ignored) {}
        fileRepository.delete(attachment);
        return true;
    }

    private FileResponse toResponse(FileAttachment a) {
        FileResponse res = new FileResponse();
        res.setFileId(a.getFileId());
        res.setPatentId(a.getPatent() != null ? a.getPatent().getPatentId() : null);
        res.setUploaderId(a.getUploaderId());
        res.setFileName(a.getFileName());
        // ✅ 프론트로는 공개 URL을 내려줌 (/files/.. 또는 S3 퍼블릭/프리사인 등 FileUtil에서 처리)
        res.setFileUrl(FileUtil.getPublicUrl(a.getFileUrl()));
        res.setFileType(a.getFileType());
        res.setContent(a.getContent());
        res.setUpdatedAt(a.getUpdatedAt());
        return res;
    }

    private FileType determineFileType(String name) {
        if (name == null) return null;
        String ext = name.contains(".") ? name.substring(name.lastIndexOf('.') + 1).toLowerCase() : "";
        return switch (ext) {
            case "png", "jpg", "jpeg", "gif", "bmp", "webp", "svg" -> FileType.IMAGE;
            case "glb" -> FileType.GLB;
            case "pdf" -> FileType.PDF;
            default -> null;
        };
    }

    public FileAttachment findById(Long id) {
        return fileRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("File not found: " + id));
    }

    // ✅ 컨트롤러 스트리밍/프리사인에 쓸 메타
    public record StorageMeta(String key, String filename, String contentType) {}

    public StorageMeta getStorageMeta(Long id) {
        var f = findById(id);
        String key = f.getFileUrl();          // DB에 저장된 S3 키 or 로컬 상대경로
        String filename = f.getFileName();
        String contentType = guessContentType(filename); // MIME 추정
        return new StorageMeta(key, filename, contentType);
    }

    // ✅ 간단 MIME 매퍼
    private String guessContentType(String filename) {
        if (filename == null) return "application/octet-stream";
        String ext = filename.contains(".") ? filename.substring(filename.lastIndexOf('.') + 1).toLowerCase() : "";
        return switch (ext) {
            case "png"  -> "image/png";
            case "jpg", "jpeg" -> "image/jpeg";
            case "gif"  -> "image/gif";
            case "bmp"  -> "image/bmp";
            case "webp" -> "image/webp";
            case "svg"  -> "image/svg+xml";
            case "pdf"  -> "application/pdf";
            case "glb"  -> "model/gltf-binary";
            default     -> "application/octet-stream";
        };
    }

    public FileAttachment findByPatentIdAndFileName(Long patentId, String fileName) {
    return fileRepository
        .findTopByPatent_PatentIdAndFileName(patentId, fileName)
        .orElseThrow(() -> new IllegalArgumentException("file not found"));
}
}
