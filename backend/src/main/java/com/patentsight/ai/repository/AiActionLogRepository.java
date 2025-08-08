package com.patentsight.ai.repository;

import com.patentsight.ai.domain.AiActionLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AiActionLogRepository extends JpaRepository<AiActionLog, Long> {

    List<AiActionLog> findByMessageIdOrderByCreatedAt(String messageId);
}
