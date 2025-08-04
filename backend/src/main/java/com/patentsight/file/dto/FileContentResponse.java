package com.patentsight.file.dto;

import com.fasterxml.jackson.annotation.JsonRawValue;
import java.time.LocalDateTime;

public class FileContentResponse {
    private Long fileId;
    private Integer versionNo;
    @JsonRawValue
    private String content;
    private LocalDateTime updatedAt;

    public Long getFileId() { return fileId; }
    public void setFileId(Long fileId) { this.fileId = fileId; }
    public Integer getVersionNo() { return versionNo; }
    public void setVersionNo(Integer versionNo) { this.versionNo = versionNo; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
