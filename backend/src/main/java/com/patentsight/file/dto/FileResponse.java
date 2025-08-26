package com.patentsight.file.dto;

import java.time.LocalDateTime;
import com.patentsight.file.domain.FileType;

/**
 * Generic file metadata returned when creating or requesting a
 * {@link com.patentsight.file.domain.FileAttachment}.
 */
public class FileResponse {
    private Long fileId;
    private Long patentId;
    private Long uploaderId;
    private String fileName;
    private String fileUrl;
    private String content;
    private LocalDateTime updatedAt;
    private FileType fileType;

    public Long getFileId() {
        return fileId;
    }

    public void setFileId(Long fileId) {
        this.fileId = fileId;
    }

    public Long getPatentId() {
        return patentId;
    }

    public void setPatentId(Long patentId) {
        this.patentId = patentId;
    }

    public Long getUploaderId() {
        return uploaderId;
    }

    public void setUploaderId(Long uploaderId) {
        this.uploaderId = uploaderId;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getFileUrl() {
        return fileUrl;
    }

    public void setFileUrl(String fileUrl) {
        this.fileUrl = fileUrl;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public FileType getFileType() {
        return fileType;
    }

    public void setFileType(FileType fileType) {
        this.fileType = fileType;
    }
}
