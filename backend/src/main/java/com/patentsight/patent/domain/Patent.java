package com.patentsight.patent.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class Patent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long patentId;

    private String title;

    @Enumerated(EnumType.STRING)
    private PatentType type;

    private Long applicantId;

    @Enumerated(EnumType.STRING)
    private PatentStatus status;

    private LocalDateTime submittedAt;

    private String ipcCode;

    // getters and setters
    public Long getPatentId() { return patentId; }
    public void setPatentId(Long patentId) { this.patentId = patentId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public PatentType getType() { return type; }
    public void setType(PatentType type) { this.type = type; }
    public Long getApplicantId() { return applicantId; }
    public void setApplicantId(Long applicantId) { this.applicantId = applicantId; }
    public PatentStatus getStatus() { return status; }
    public void setStatus(PatentStatus status) { this.status = status; }
    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }
    public String getIpcCode() { return ipcCode; }
    public void setIpcCode(String ipcCode) { this.ipcCode = ipcCode; }
}
