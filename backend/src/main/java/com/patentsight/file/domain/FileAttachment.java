package com.patentsight.file.domain;

import com.patentsight.patent.domain.Patent;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class FileAttachment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long fileId;

    @ManyToOne
    @JoinColumn(name = "patent_id")
    private Patent patent;

    private Long uploaderId;

    /**
     * Original name of the uploaded file. Used for download/display
     * purposes only and is not guaranteed to be unique.
     */
    private String fileName;

    /**
     * Location of the stored file. When running in production this will
     * typically be an S3 URL or object key. For local development we
     * persist files to the local file system and keep the relative path
     * here so the client can retrieve the file directly.
     */
    private String fileUrl;

    /**
     * All patent documents are stored as raw JSON text rather than as binary
     * files on disk. The content column keeps the latest text for the
     * attachment and is versioned separately through {@link SpecVersion}.
     */
    @Lob
    private String content;

    private LocalDateTime updatedAt;

    // getters and setters
    public Long getFileId() { return fileId; }
    public void setFileId(Long fileId) { this.fileId = fileId; }
    public Patent getPatent() { return patent; }
    public void setPatent(Patent patent) { this.patent = patent; }
    public Long getUploaderId() { return uploaderId; }
    public void setUploaderId(Long uploaderId) { this.uploaderId = uploaderId; }
    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }
    public String getFileUrl() { return fileUrl; }
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
