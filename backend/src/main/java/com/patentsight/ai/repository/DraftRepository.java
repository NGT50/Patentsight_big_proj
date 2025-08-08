package com.patentsight.ai.repository;

import com.patentsight.ai.domain.Draft;
import com.patentsight.ai.domain.DraftType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DraftRepository extends JpaRepository<Draft, Long> {

    List<Draft> findByPatentIdOrderByCreatedAtDesc(Long patentId);

    void deleteByPatentId(Long patentId);
}
