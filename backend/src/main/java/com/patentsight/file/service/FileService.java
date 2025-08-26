package com.patentsight.file.service;

import com.patentsight.file.domain.FileAttachment;
import com.patentsight.file.dto.FileResponse;
import com.patentsight.file.domain.FileType;
import com.patentsight.file.exception.S3UploadException;
import com.patentsight.file.repository.FileRepository;
import com.patentsight.global.util.FileUtil;
import com.patentsight.patent.domain.Patent;
import com.patentsight.patent.repository.PatentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;

@Service
@Transactional
public class FileService {

    private final FileRepository fileRepository;
    private final PatentRepository patentRepository;

    public FileService(FileRepository fileRepository, PatentRepository patentRepository) {
        this.fileRepository = fileRepository;
        this.patentRepository = patentRepository;
    }

    /**
     * Stores the given file on disk (or S3 in production) and returns the
     * metadata for the created {@link FileAttachment}.
     */
    public FileResponse create(MultipartFile file, Long uploaderId, Long patentId) {
        try {
            String path = FileUtil.saveFile(file);
            FileAttachment attachment = new FileAttachment();
            attachment.setUploaderId(uploaderId);
            attachment.setFileName(file.getOriginalFilename());
            attachment.setFileUrl(path);
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
            FileUtil.deleteFile(attachment.getFileUrl());
            String path = FileUtil.saveFile(file);
            attachment.setFileName(file.getOriginalFilename());
            attachment.setFileUrl(path);
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
            FileUtil.deleteFile(attachment.getFileUrl());
        } catch (IOException ignored) {
        }
        fileRepository.delete(attachment);
        return true;
    }

    /**
     * Loads the binary content for the given attachment id. Returns {@code null}
     * when the attachment does not exist.
     */
    public FileData loadContent(Long id) {
        FileAttachment attachment = fileRepository.findById(id).orElse(null);
        if (attachment == null) {
            return null;
        }
        try {
            byte[] data = FileUtil.downloadFile(attachment.getFileUrl());
            return new FileData(attachment, data);
        } catch (IOException e) {
            throw new S3UploadException("Could not load file: " + e.getMessage(), e);
        }
    }

    /** Container for an attachment and its binary bytes. */
    public static class FileData {
        private final FileAttachment attachment;
        private final byte[] bytes;

        public FileData(FileAttachment attachment, byte[] bytes) {
            this.attachment = attachment;
            this.bytes = bytes;
        }

        public FileAttachment getAttachment() {
            return attachment;
        }

        public byte[] getBytes() {
            return bytes;
        }
    }

    private FileResponse toResponse(FileAttachment attachment) {
        FileResponse res = new FileResponse();
        res.setFileId(attachment.getFileId());
        res.setPatentId(attachment.getPatent() != null ? attachment.getPatent().getPatentId() : null);
        res.setUploaderId(attachment.getUploaderId());
        res.setFileName(attachment.getFileName());
        res.setFileUrl(FileUtil.getPublicUrl(attachment.getFileUrl()));
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
}
