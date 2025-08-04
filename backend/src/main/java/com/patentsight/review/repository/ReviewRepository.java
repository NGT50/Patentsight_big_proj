package com.patentsight.review.repository;

import com.patentsight.review.domain.Review;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    // User 엔티티의 PK 이름이 id이므로 이렇게 작성
    List<Review> findByExaminerId(Long examinerId);
}