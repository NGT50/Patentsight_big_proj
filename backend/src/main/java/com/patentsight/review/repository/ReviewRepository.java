package com.patentsight.review.repository;

import com.patentsight.patent.domain.PatentType;
import com.patentsight.review.domain.Review;
import com.patentsight.review.domain.Review.Decision; // Review.Decision import

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional; // Optional import 추가

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    // 심사관 ID로 조회
    List<Review> findByExaminer_UserId(Long examinerId);

    // 심사관 ID와 결정 상태로 조회
    List<Review> findByExaminer_UserIdAndDecision(Long examinerId, Decision decision);

    // 심사관 ID와 reviewType으로 조회
    List<Review> findByExaminerUserIdAndReviewType(Long examinerId, PatentType reviewType);

    // 심사관 ID, reviewType, 결정 상태로 조회
    List<Review> findByExaminerUserIdAndReviewTypeAndDecision(Long examinerId, PatentType reviewType, Decision decision);

    // Patent ID로 Review 조회 (submitReview에서 사용)
    Optional<Review> findByPatent_PatentId(Long patentId); // Optional로 반환하는 것이 더 안전

    // 심사 목록 검색을 위한 다양한 조합의 메서드 (ReviewServiceImpl의 searchReviews에 따라 필요)
    // 현재 ReviewServiceImpl의 searchReviews는 findByExaminer_UserId만 사용하므로,
    // 아래 메서드들은 필요에 따라 추가하거나 @Query로 대체할 수 있습니다.
    List<Review> findByExaminerUserIdAndDecisionAndPatentTitleContainingIgnoreCaseAndPatentApplicantId(
        Long examinerId, Decision decision, String title, Long applicantId);

    List<Review> findByExaminerUserIdAndDecisionAndPatentTitleContainingIgnoreCase(
        Long examinerId, Decision decision, String title);

    List<Review> findByExaminerUserIdAndDecisionAndPatentApplicantId(
        Long examinerId, Decision decision, Long applicantId);
    
    List<Review> findByExaminerUserIdAndPatentTitleContainingIgnoreCaseAndPatentApplicantId(
        Long examinerId, String title, Long applicantId);

    List<Review> findByExaminerUserIdAndPatentTitleContainingIgnoreCase(Long examinerId, String title);
    List<Review> findByExaminerUserIdAndPatentApplicantId(Long examinerId, Long applicantId);
}
