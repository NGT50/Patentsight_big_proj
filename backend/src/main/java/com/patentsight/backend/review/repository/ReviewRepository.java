package com.patentsight.backend.review.repository;

import com.patentsight.backend.review.domain.Review;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByExaminerUserId(Long examinerId);
}
