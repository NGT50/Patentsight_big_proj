package com.patentsight.review.repository;

import com.patentsight.review.domain.Review;
import com.patentsight.review.dto.ReviewSearchResponse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    // 🔹 특정 특허의 Review 조회
    List<Review> findByPatent_PatentId(Long patentId);

    // 🔹 특정 특허의 가장 최근 Review 조회
    Optional<Review> findTopByPatent_PatentIdOrderByReviewedAtDesc(Long patentId);

    // 🔹 상태별 Review 개수
    long countByDecision(Review.Decision decision);

    // 🔹 심사관별 Review 목록 조회
    List<Review> findByExaminer_UserId(Long userId);

    // 🔹 상태 + 심사관 필터링
    List<Review> findByExaminer_UserIdAndDecision(Long userId, Review.Decision decision);

    // 🔹 심사 검색 쿼리 (기존 코드)
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
