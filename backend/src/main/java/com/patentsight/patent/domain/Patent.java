package com.patentsight.patent.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;


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

    private String cpc;

    private String ipc;

    private String applicationNumber;

    private String inventor;

    private String technicalField;

    @Lob
    private String backgroundTechnology;

    @Lob
    private String problemToSolve;

    @Lob
    private String solution;

    @Lob
    private String effect;

    @Lob
    private String summary;

    @Lob
    private String drawingDescription;

    @ElementCollection
    @CollectionTable(name = "patent_claims", joinColumns = @JoinColumn(name = "patent_id"))
    @Column(name = "claim_text")
    private List<String> claims;

    // getters and setters
    public String getIpc() { return ipc; }
    public void setIpc(String ipc) { this.ipc = ipc; }
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
    public String getCpc() { return cpc; }
    public void setCpc(String cpc) { this.cpc = cpc; }
    public String getApplicationNumber() { return applicationNumber; }
    public void setApplicationNumber(String applicationNumber) { this.applicationNumber = applicationNumber; }
    public String getInventor() { return inventor; }
    public void setInventor(String inventor) { this.inventor = inventor; }
    public String getTechnicalField() { return technicalField; }
    public void setTechnicalField(String technicalField) { this.technicalField = technicalField; }
    public String getBackgroundTechnology() { return backgroundTechnology; }
    public void setBackgroundTechnology(String backgroundTechnology) { this.backgroundTechnology = backgroundTechnology; }
    public String getProblemToSolve() { return problemToSolve; }
    public void setProblemToSolve(String problemToSolve) { this.problemToSolve = problemToSolve; }
    public String getSolution() { return solution; }
    public void setSolution(String solution) { this.solution = solution; }
    public String getEffect() { return effect; }
    public void setEffect(String effect) { this.effect = effect; }
    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }
    public String getDrawingDescription() { return drawingDescription; }
    public void setDrawingDescription(String drawingDescription) { this.drawingDescription = drawingDescription; }
    public List<String> getClaims() { return claims; }
    public void setClaims(List<String> claims) { this.claims = claims; }
}
