package com.patentsight.ai.domain;

import jakarta.persistence.*;

@Entity
public class SearchResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String resultId;
    private Long patentId;
    private String similarPatentCode;
    private String title;
    private String ipcCode;
    private double similarityScore;

    // Getter/Setter 생략 가능
}
