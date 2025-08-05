package com.patentsight.file.dto;

import com.patentsight.patent.dto.PatentResponse;

import java.time.LocalDateTime;

/**
 * Response payload for returning the latest document content of a patent.
 */
public class DocumentContentResponse {

    private Integer versionNo;
    private PatentResponse document;
    private LocalDateTime updatedAt;

    public Integer getVersionNo() {
        return versionNo;
    }

    public void setVersionNo(Integer versionNo) {
        this.versionNo = versionNo;
    }

    public PatentResponse getDocument() {
        return document;
    }

    public void setDocument(PatentResponse document) {
        this.document = document;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}

