package com.patentsight.file.dto;

public class FileVersionInfoRequest {
    private String changeSummary;
    private Boolean isCurrent;

    public String getChangeSummary() { return changeSummary; }
    public void setChangeSummary(String changeSummary) { this.changeSummary = changeSummary; }
    public Boolean getIsCurrent() { return isCurrent; }
    public void setIsCurrent(Boolean isCurrent) { this.isCurrent = isCurrent; }
}
