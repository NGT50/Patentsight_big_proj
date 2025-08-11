package com.patentsight.ai.domain;

import com.patentsight.file.domain.FileAttachment;
import jakarta.persistence.*;

@Entity
public class Generated3DModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String resultId;

    @ManyToOne
    @JoinColumn(name = "generated_file_id")
    private FileAttachment generatedFile;

    @ManyToOne
    @JoinColumn(name = "source_file_id")
    private FileAttachment sourceFile;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getResultId() {
        return resultId;
    }

    public void setResultId(String resultId) {
        this.resultId = resultId;
    }

    public FileAttachment getGeneratedFile() {
        return generatedFile;
    }

    public void setGeneratedFile(FileAttachment generatedFile) {
        this.generatedFile = generatedFile;
    }

    public FileAttachment getSourceFile() {
        return sourceFile;
    }

    public void setSourceFile(FileAttachment sourceFile) {
        this.sourceFile = sourceFile;
    }
}
