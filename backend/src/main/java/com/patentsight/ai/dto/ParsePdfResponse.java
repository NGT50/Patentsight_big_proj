package com.patentsight.ai.dto;

import lombok.Data;
import java.util.List;

@Data
public class ParsePdfResponse {
    private String title;
    private String technicalField;
    private String backgroundTechnology;
    private List<String> claims;

    // String -> InventionDetails 객체로 변경
    private InventionDetails inventionDetails;

    // --- 세부 항목을 담을 내부 클래스 추가 ---
    @Data
    public static class InventionDetails {
        private String problemToSolve;
        private String solution;
        private String effect;
    }
}