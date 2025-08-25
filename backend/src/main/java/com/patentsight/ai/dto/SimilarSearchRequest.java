package com.patentsight.ai.dto;

import lombok.Data;

/**
 * 유사 특허 검색 요청 DTO
 * - FastAPI 모델 서버에 보낼 요청 형태
 */
@Data
public class SimilarSearchRequest {
    private String patentId;     // 검색 기준 특허 ID (없으면 null 가능)
    private String searchQuery;  // 검색 질의(청구항/문장 등)
    private String searchType;   // claim | abstract | full 등
}
