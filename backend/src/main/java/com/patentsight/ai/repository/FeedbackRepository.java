package com.patentsight.ai.repository;

import com.patentsight.ai.domain.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface FeedbackRepository extends JpaRepository<Feedback, Long> {

    Optional<Feedback> findByResultId(String resultId);
}
