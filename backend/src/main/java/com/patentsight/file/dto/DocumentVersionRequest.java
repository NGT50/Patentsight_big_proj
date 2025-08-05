package com.patentsight.file.dto;

import com.patentsight.patent.dto.PatentRequest;

/**
 * Request body for creating a new document version.
 */
public class DocumentVersionRequest {

    private PatentRequest newDocument;
    private Long authorId;
    private String changeSummary;

    public PatentRequest getNewDocument() {
        return newDocument;
    }

    public void setNewDocument(PatentRequest newDocument) {
        this.newDocument = newDocument;
    }

    public Long getAuthorId() {
        return authorId;
    }

    public void setAuthorId(Long authorId) {
        this.authorId = authorId;
    }

    public String getChangeSummary() {
        return changeSummary;
    }

    public void setChangeSummary(String changeSummary) {
        this.changeSummary = changeSummary;
    }
}

