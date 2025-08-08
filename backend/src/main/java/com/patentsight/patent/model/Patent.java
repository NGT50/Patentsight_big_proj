package com.patentsight.patent.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "patents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Patent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long patentId;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String type;

    @ManyToMany
    @JoinTable(
            name = "patent_attachments",
            joinColumns = @JoinColumn(name = "patent_id"),
            inverseJoinColumns = @JoinColumn(name = "attachment_id")
    )
    @Builder.Default
    private Set<FileAttachment> attachments = new HashSet<>();
}
