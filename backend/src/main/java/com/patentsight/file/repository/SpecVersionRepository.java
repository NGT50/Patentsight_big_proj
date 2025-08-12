package com.patentsight.file.repository;

import com.patentsight.file.domain.SpecVersion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SpecVersionRepository extends JpaRepository<SpecVersion, Long> {
    List<SpecVersion> findByPatent_PatentIdOrderByVersionNoDesc(Long patentId);
    SpecVersion findFirstByPatent_PatentIdAndIsCurrentTrue(Long patentId);
}
