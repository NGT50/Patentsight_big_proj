package com.patentsight.file.dto;

import com.patentsight.patent.dto.PatentRequest;

/**
 * Request body for creating a new document version.
 */
public class DocumentVersionRequest {

    private PatentRequest newDocument;
    private Long applicantId;
    private String changeSummary;

    public PatentRequest getNewDocument() {
        return newDocument;
    }

    public void setNewDocument(PatentRequest newDocument) {
        this.newDocument = newDocument;
    }

    public Long getApplicantId() {
        return applicantId;
    }

    public void setApplicantId(Long applicantId) {
        this.applicantId = applicantId;
    }

    public String getChangeSummary() {
        return changeSummary;
    }

    public void setChangeSummary(String changeSummary) {
        this.changeSummary = changeSummary;
    }
}

