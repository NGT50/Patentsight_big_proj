package com.patentsight.ai.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class AiActionLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String actionId;
    private String messageId;

    private String actionType;
    private String actionInput;

    @Column(length = 2000)
    private String actionOutput;

    private String status;

    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }
}
