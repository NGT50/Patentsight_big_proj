package com.patentsight.ai.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class AiCheck {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long patentId;

    private String checkId;      // UUID 등
    private String status;       // ex. "PROCESSING", "DONE"
    private Double riskScore;    // GPT가 반환한 위험도
    private String resultJson;   // 결과 상세 내용 (JSON 문자열)

    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }

    // Getter / Setter 생략 가능 (Lombok 추천)
}
