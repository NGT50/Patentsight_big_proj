package com.patentsight.file.repository;

import com.patentsight.file.domain.FileAttachment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FileRepository extends JpaRepository<FileAttachment, Long> {
}
