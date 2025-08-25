package com.patentsight.ai.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class AiChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String messageId;
    private String sessionId;

    private String sender;   // "user" or "ai"
    private String content;

    @Column(length = 2000)
    private String executedFeatures; // JSON 배열 형태로 저장해도 됨

    @Column(length = 2000)
    private String featuresResult;

    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }
}
