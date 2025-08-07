package com.patentsight.file.service;

import com.patentsight.file.domain.FileAttachment;
import com.patentsight.file.dto.FileResponse;
import com.patentsight.file.repository.FileRepository;
import com.patentsight.global.util.FileUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;

@Service
@Transactional
public class FileService {

    private final FileRepository fileRepository;

    public FileService(FileRepository fileRepository) {
        this.fileRepository = fileRepository;
    }

    /**
     * Stores the given file on disk (or S3 in production) and returns the
     * metadata for the created {@link FileAttachment}.
     */
    public FileResponse create(MultipartFile file, Long uploaderId) {
        try {
            String path = FileUtil.saveFile(file);
            FileAttachment attachment = new FileAttachment();
            attachment.setUploaderId(uploaderId);
            attachment.setFileName(file.getOriginalFilename());
            attachment.setFileUrl(path);
            attachment.setUpdatedAt(LocalDateTime.now());
            fileRepository.save(attachment);
            return toResponse(attachment);
        } catch (IOException e) {
            throw new RuntimeException("Could not store file", e);
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
            attachment.setUpdatedAt(LocalDateTime.now());
            fileRepository.save(attachment);
            return toResponse(attachment);
        } catch (IOException e) {
            throw new RuntimeException("Could not update file", e);
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

    private FileResponse toResponse(FileAttachment attachment) {
        FileResponse res = new FileResponse();
        res.setFileId(attachment.getFileId());
        res.setPatentId(attachment.getPatent() != null ? attachment.getPatent().getPatentId() : null);
        res.setUploaderId(attachment.getUploaderId());
        res.setFileName(attachment.getFileName());
        res.setFileUrl(attachment.getFileUrl());
        res.setContent(attachment.getContent());
        res.setUpdatedAt(attachment.getUpdatedAt());
        return res;
    }
}
