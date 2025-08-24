package com.patentsight.patent.dto;

import com.patentsight.patent.domain.PatentStatus;
import com.patentsight.patent.domain.PatentType;
import java.util.List;

public class PatentResponse {
    private Long patentId;
    private Long applicantId;
    private String title;
    private PatentType type;
    private PatentStatus status;
    private List<Long> attachmentIds;
    private String cpc;
    private String applicationNumber;
    private String inventor;
    private String technicalField;
    private String backgroundTechnology;
    private InventionDetails inventionDetails;
    private String summary;
    private String drawingDescription;
    private List<String> claims;
    private String ipc;
    private String applicantName;

    public Long getPatentId() { return patentId; }
    public void setPatentId(Long patentId) { this.patentId = patentId; }
    public Long getApplicantId() { return applicantId; }
    public void setApplicantId(Long applicantId) { this.applicantId = applicantId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public PatentType getType() { return type; }
    public void setType(PatentType type) { this.type = type; }
    public PatentStatus getStatus() { return status; }
    public void setStatus(PatentStatus status) { this.status = status; }
    public List<Long> getAttachmentIds() { return attachmentIds; }
    public void setAttachmentIds(List<Long> attachmentIds) { this.attachmentIds = attachmentIds; }
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
    public InventionDetails getInventionDetails() { return inventionDetails; }
    public void setInventionDetails(InventionDetails inventionDetails) { this.inventionDetails = inventionDetails; }
    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }
    public String getDrawingDescription() { return drawingDescription; }
    public void setDrawingDescription(String drawingDescription) { this.drawingDescription = drawingDescription; }
    public List<String> getClaims() { return claims; }
    public void setClaims(List<String> claims) { this.claims = claims; }
    public String getIpc() { return ipc; }
    public void setIpc(String ipc) { this.ipc = ipc; }
    public String getApplicantName() { return applicantName; }
    public void setApplicantName(String applicantName) { this.applicantName = applicantName; }
    // CICD test용 주석3
    public static class InventionDetails {
        private String problemToSolve;
        private String solution;
        private String effect;

        public String getProblemToSolve() { return problemToSolve; }
        public void setProblemToSolve(String problemToSolve) { this.problemToSolve = problemToSolve; }
        public String getSolution() { return solution; }
        public void setSolution(String solution) { this.solution = solution; }
        public String getEffect() { return effect; }
        public void setEffect(String effect) { this.effect = effect; }
    }
}
