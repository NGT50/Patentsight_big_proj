package com.patentsight.file.repository;

import com.patentsight.file.domain.FileAttachment;
import com.patentsight.file.domain.FileType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FileRepository extends JpaRepository<FileAttachment, Long> {

    // ★ 추가된 부분: 특정 특허에 속한 파일만 조회
    List<FileAttachment> findByPatent_PatentId(Long patentId);

    Optional<FileAttachment> findTopByPatent_PatentIdAndFileType(Long patentId, FileType fileType);
}
