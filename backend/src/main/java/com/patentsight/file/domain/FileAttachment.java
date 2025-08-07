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
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
