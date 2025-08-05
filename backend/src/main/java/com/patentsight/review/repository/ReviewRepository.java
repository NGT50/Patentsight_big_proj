package com.patentsight.review.repository;

import com.patentsight.review.domain.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.patentsight.patent.domain.Patent;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByExaminerUserId(Long examinerId);

    List<Review> findByExaminerUserIdAndDecision(Long examinerId, Review.Decision decision);

    @Query("""
        SELECT r FROM Review r
        JOIN r.patent p
        LEFT JOIN p.applicant a
        WHERE r.examiner.userId = :examinerId
        AND (:status IS NULL OR r.decision = :status)
        AND (:title IS NULL OR p.title LIKE CONCAT('%', :title, '%'))
        AND (:applicantName IS NULL OR (a IS NOT NULL AND a.name LIKE CONCAT('%', :applicantName, '%')))
        AND (:applicantId IS NULL OR (a IS NOT NULL AND a.userId = :applicantId))
    """)
    List<Review> searchReviews(
            @Param("examinerId") Long examinerId,
            @Param("status") Review.Decision status,
            @Param("title") String title,
            @Param("applicantName") String applicantName,
            @Param("applicantId") Long applicantId
    );
}
