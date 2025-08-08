package com.patentsight.ai.repository;

import com.patentsight.ai.domain.SearchResult;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SearchResultRepository extends JpaRepository<SearchResult, Long> {

    List<SearchResult> findByPatentIdOrderBySimilarityScoreDesc(Long patentId);
}
