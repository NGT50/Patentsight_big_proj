package com.patentsight.file.dto;

import com.patentsight.patent.dto.PatentRequest;

/**
 * Request wrapper for updating or saving the current document content of a patent.
 * The document itself mirrors the fields used when creating or updating a patent.
 */
public class DocumentContentRequest {

    private PatentRequest document;

    public PatentRequest getDocument() {
        return document;
    }

    public void setDocument(PatentRequest document) {
        this.document = document;
    }
}

