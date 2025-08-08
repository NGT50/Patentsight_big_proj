package com.patentsight.ai.repository;

import com.patentsight.ai.domain.AiCheck;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AiCheckRepository extends JpaRepository<AiCheck, Long> {

    Optional<AiCheck> findByCheckId(String checkId);
}
