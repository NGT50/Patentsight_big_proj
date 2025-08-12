package com.patentsight.ai.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class AiChatSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String sessionId;
    private Long patentId;
    private String sessionType; // "CHECK", "DRAFT"
    private LocalDateTime startedAt;
    private LocalDateTime endedAt;

    @PrePersist
    public void prePersist() {
        this.startedAt = LocalDateTime.now();
    }

    // Getter / Setter
}
