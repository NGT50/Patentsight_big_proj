package com.patentsight.file.domain;

import com.patentsight.patent.domain.Patent;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class SpecVersion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long versionId;

    @ManyToOne
    @JoinColumn(name = "patent_id")
    private Patent patent;

    private int versionNo;

    @ManyToOne
    @JoinColumn(name = "file_id")
    private FileAttachment file;

    private Long authorId;

    @Lob
    private String changeSummary;

    private boolean isCurrent;

    private LocalDateTime createdAt;

    // getters and setters
    public Long getVersionId() { return versionId; }
    public void setVersionId(Long versionId) { this.versionId = versionId; }
    public Patent getPatent() { return patent; }
    public void setPatent(Patent patent) { this.patent = patent; }
    public int getVersionNo() { return versionNo; }
    public void setVersionNo(int versionNo) { this.versionNo = versionNo; }
    public FileAttachment getFile() { return file; }
    public void setFile(FileAttachment file) { this.file = file; }
    public Long getAuthorId() { return authorId; }
    public void setAuthorId(Long authorId) { this.authorId = authorId; }
    public String getChangeSummary() { return changeSummary; }
    public void setChangeSummary(String changeSummary) { this.changeSummary = changeSummary; }
    public boolean isCurrent() { return isCurrent; }
    public void setCurrent(boolean current) { isCurrent = current; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
