package com.patentsight.patent.dto;

import com.patentsight.patent.domain.PatentType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public class PatentRequest {
    @NotBlank
    private String title;

    @NotNull
    private PatentType type;

    @NotBlank
    private String cpc;

    @NotBlank
    private String inventor;

    @NotBlank
    private String technicalField;

    @NotBlank
    private String backgroundTechnology;

    @Valid
    @NotNull
    private InventionDetails inventionDetails;

    @NotBlank
    private String summary;

    @NotBlank
    private String drawingDescription;

    @NotEmpty
    private List<@NotBlank String> claims;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public PatentType getType() { return type; }
    public void setType(PatentType type) { this.type = type; }
    public String getCpc() { return cpc; }
    public void setCpc(String cpc) { this.cpc = cpc; }
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

    public static class InventionDetails {
        @NotBlank
        private String problemToSolve;

        @NotBlank
        private String solution;

        @NotBlank
        private String effect;

        public String getProblemToSolve() { return problemToSolve; }
        public void setProblemToSolve(String problemToSolve) { this.problemToSolve = problemToSolve; }
        public String getSolution() { return solution; }
        public void setSolution(String solution) { this.solution = solution; }
        public String getEffect() { return effect; }
        public void setEffect(String effect) { this.effect = effect; }
    }
}
