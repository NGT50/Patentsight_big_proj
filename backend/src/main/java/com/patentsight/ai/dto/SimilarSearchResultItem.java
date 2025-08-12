package com.patentsight.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 응답의 개별 특허 항목
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SimilarSearchResultItem {
    private String resultId;            // 고유 결과 ID
    private String similarPatentCode;   // 유사 특허 코드
    private Double similarityScore;     // 유사도 (0~1)
}
