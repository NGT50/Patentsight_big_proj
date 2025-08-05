package com.patentsight.patent.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "file_attachments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FileAttachment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Additional fields can be added as necessary
}
