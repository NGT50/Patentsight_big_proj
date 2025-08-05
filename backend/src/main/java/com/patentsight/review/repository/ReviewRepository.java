package com.patentsight.review.repository;

import com.patentsight.review.domain.Review;
import com.patentsight.review.dto.ReviewSearchResponse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {

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
}
