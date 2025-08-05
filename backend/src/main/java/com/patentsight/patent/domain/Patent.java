package com.patentsight.patent.domain;

import com.patentsight.user.domain.User;
import jakarta.persistence.*;
import java.time.LocalDateTime;
@Entity
public class Patent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long patentId;  // 임시 출원 ID

    private String title;

    @Enumerated(EnumType.STRING)
    private PatentType type;

    // 출원인(User)와 연결
    @ManyToOne
    @JoinColumn(name = "applicant_id", nullable = true) // 출원 확정 전이면 NULL
    private User applicant;

    @Enumerated(EnumType.STRING)
    private PatentStatus status;

    private LocalDateTime submittedAt;
    private String ipcCode;

    // --- Getter / Setter ---
    public Long getPatentId() { return patentId; }
    public void setPatentId(Long patentId) { this.patentId = patentId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public PatentType getType() { return type; }
    public void setType(PatentType type) { this.type = type; }
    public User getApplicant() { return applicant; }
    public void setApplicant(User applicant) { this.applicant = applicant; }
    public PatentStatus getStatus() { return status; }
    public void setStatus(PatentStatus status) { this.status = status; }
    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }
    public String getIpcCode() { return ipcCode; }
    public void setIpcCode(String ipcCode) { this.ipcCode = ipcCode; }
}
