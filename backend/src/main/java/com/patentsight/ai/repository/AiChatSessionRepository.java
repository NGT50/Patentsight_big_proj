package com.patentsight.ai.repository;

import com.patentsight.ai.domain.AiChatSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AiChatSessionRepository extends JpaRepository<AiChatSession, Long> {

    Optional<AiChatSession> findBySessionId(String sessionId);
}
