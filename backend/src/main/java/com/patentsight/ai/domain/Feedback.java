package com.patentsight.ai.domain;

import jakarta.persistence.*;

@Entity
public class Feedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String resultId;
    private boolean helpful;

    @Column(length = 1000)
    private String comment;

    private String updatedAt;

    @PrePersist
    public void prePersist() {
        this.updatedAt = java.time.LocalDateTime.now().toString();
    }
}
