package com.patentsight.review.repository;

import com.patentsight.review.domain.Review;
import com.patentsight.review.dto.ReviewSearchResponse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    // 🔹 기존 검색용 쿼리
    @Query("""
        SELECT new com.patentsight.review.dto.ReviewSearchResponse(
            r.reviewId, 
            p.title, 
            '', 
            r.decision, 
            r.reviewType, 
            r.autoAssigned, 
            r.reviewedAt
        )
        FROM Review r
        JOIN r.patent p
        WHERE r.examiner.userId = :examinerId
        AND (:status IS NULL OR r.decision = :status)
        AND (:title IS NULL OR p.title LIKE CONCAT('%', :title, '%'))
        AND (:applicantId IS NULL OR p.applicantId = :applicantId)
    """)
    List<ReviewSearchResponse> searchReviews(
            @Param("examinerId") Long examinerId,
            @Param("status") Review.Decision status,
            @Param("title") String title,
            @Param("applicantId") Long applicantId
    );

    // 상태 필터 없이
    List<Review> findByExaminer_UserId(Long userId);

    // 상태 필터 적용
    List<Review> findByExaminer_UserIdAndDecision(Long userId, Review.Decision decision);

}
