package com.patentsight.ai.dto;

import lombok.Data;
import java.util.List;

/**
 * 유사 특허 검색 API 응답 DTO
 */
@Data
public class SimilarSearchResponse {
    private String mainPatentQuery;               // 메인 검색 질의
    private BasicInfo basicInfo;                  // 특허 기본정보
    private List<SimilarSearchResultItem> results; // 유사 특허 리스트

    @Data
    public static class BasicInfo {
        private String applicantName;
        private String applicationDate;
        private String applicationNumber;
        private String astrtCont;
        private String bigDrawing;
        private String drawing;
        private String inventionTitle;
        private String ipcNumber;
        private String openDate;
        private String openNumber;
        private String publicationDate;
        private String registerDate;
        private String registerNumber;
        private String registerStatus;
    }
}
