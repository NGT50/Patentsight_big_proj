package com.patentsight.review.service;

import com.patentsight.patent.domain.Patent;
import com.patentsight.patent.domain.PatentStatus;
import com.patentsight.patent.repository.PatentRepository;
import com.patentsight.review.domain.Review;
import com.patentsight.review.dto.*;
import com.patentsight.review.repository.ReviewRepository;
import com.patentsight.user.domain.User;
import com.patentsight.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final PatentRepository patentRepository;
    private final UserRepository userRepository;

    // 1️⃣ 심사관 수동 배정
    @Override
    public Review assignReviewer(AssignRequest request) {
        Patent patent = patentRepository.findByApplicationNumber(request.getApplicationNumber())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Patent not found with application number: " + request.getApplicationNumber()));

        User examiner = userRepository.findById(request.getExaminerId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Examiner not found with ID: " + request.getExaminerId()));

        // 심사관이 배정되면 Patent의 상태를 SUBMITTED로 유지합니다.
        if (patent.getStatus() != PatentStatus.SUBMITTED) {
             throw new IllegalStateException("This patent is not in a SUBMITTED state. Current status: " + patent.getStatus());
        }

        Review review = new Review();
        review.setPatent(patent);
        review.setExaminer(examiner);
        // [수정] Review의 초기 상태를 PENDING 대신 SUBMITTED(심사대기)로 설정합니다.
        review.setDecision(Review.Decision.SUBMITTED);
        review.setReviewedAt(null);
        review.setAutoAssigned(false);

        return reviewRepository.save(review);
    }

    // 2️⃣ 자동 배정 (미구현)
    @Override
    public List<Review> autoAssign(String type) {
        // TODO: 특허 타입별 자동 배정 로직 구현
        return List.of();
    }

    // 3️⃣ 심사 목록 조회
    @Override
    @Transactional(readOnly = true)
    public List<ReviewListResponse> getReviewList(Long userId, String status) {
        List<Review> reviews = reviewRepository.findByExaminer_UserId(userId);
        return reviews.stream()
                .map(this::toReviewListResponse)
                .collect(Collectors.toList());
    }

    /**
     * Review 엔티티를 ReviewListResponse DTO로 변환하는 헬퍼 메소드
     */
    private ReviewListResponse toReviewListResponse(Review review) {
        Patent patent = review.getPatent();
        String receptionDate = patent.getSubmittedAt() != null 
                ? patent.getSubmittedAt().toLocalDate().toString() 
                : null;

        return ReviewListResponse.builder()
                .reviewId(review.getReviewId())
                .patentTitle(patent.getTitle())
                .applicantName(getApplicantName(patent.getApplicantId()))
                .examinerName(review.getExaminer().getName())
                // [수정] Review의 Decision을 상태값으로 사용합니다.
                .status(review.getDecision().name())
                .receptionDate(receptionDate)
                .build();
    }
    
    private String getApplicantName(Long applicantId) {
        return userRepository.findById(applicantId)
                .map(User::getName)
                .orElse("");
    }

    // 4️⃣ 심사 상세 조회
    @Override
    @Transactional(readOnly = true)
    public ReviewDetailResponse getReviewDetail(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("Review not found with ID: " + reviewId));
        
        Patent patent = review.getPatent();
        User applicant = userRepository.findById(patent.getApplicantId())
                .orElseThrow(() -> new IllegalArgumentException("Applicant not found with ID: " + patent.getApplicantId()));

        // ReviewDetailResponse.from DTO가 Review와 Applicant 정보를 받도록 유지합니다.
        return ReviewDetailResponse.from(review, applicant);
    }

    // 5️⃣ 심사 결과 제출
    @Override
    public Review submitReview(SubmitReviewRequest request) {
        Review review = reviewRepository.findByPatent_PatentId(request.getPatentId())
                .orElseThrow(() -> new IllegalArgumentException("Review not found for Patent ID: " + request.getPatentId()));

        Patent patent = review.getPatent();
        
        // [수정] 프론트엔드에서 오는 'PENDING'을 'REVIEWING'으로 처리합니다.
        String requestedDecision = request.getDecision().toUpperCase();
        Review.Decision newDecision;
        if ("PENDING".equals(requestedDecision)) {
            newDecision = Review.Decision.REVIEWING;
        } else {
            newDecision = Review.Decision.valueOf(requestedDecision);
        }
        
        review.setDecision(newDecision);
        review.setComment(request.getComment());
        review.setReviewedAt(LocalDateTime.now());
        
        // [수정] 제출된 decision에 따라 Patent의 상태를 동기화합니다.
        switch(newDecision) {
            case APPROVE:
                patent.setStatus(PatentStatus.APPROVED);
                break;
            case REJECT:
                patent.setStatus(PatentStatus.REJECTED);
                break;
            case REVIEWING:
                patent.setStatus(PatentStatus.REVIEWING);
                break;
            // SUBMITTED는 초기 상태이므로 여기서 변경하지 않음
        }
        patentRepository.save(patent);

        return reviewRepository.save(review);
    }

    // 6️⃣ 심사관별 대시보드 요약
    @Override
    @Transactional(readOnly = true)
    public DashboardResponse getDashboard(Long userId) {
        List<Review> reviews = reviewRepository.findByExaminer_UserId(userId);

        // [수정] Review의 Decision을 기준으로 정확한 통계를 계산합니다.
        return DashboardResponse.builder()
                .total(reviews.size())
                .submitted(reviews.stream().filter(r -> r.getDecision() == Review.Decision.SUBMITTED).count())
                .inReview(reviews.stream().filter(r -> r.getDecision() == Review.Decision.REVIEWING).count())
                .completed(reviews.stream().filter(r -> r.getDecision() == Review.Decision.APPROVE).count())
                .rejected(reviews.stream().filter(r -> r.getDecision() == Review.Decision.REJECT).count())
                .build();
    }

    // 7️⃣ 최근 활동 (미구현)
    @Override
    public List<RecentActivityResponse> getRecentActivities() {
        return List.of(); 
    }

    // 8️⃣ 심사 목록 검색
    @Override
    @Transactional(readOnly = true)
    public List<ReviewSearchResponse> searchReviews(Long examinerId, String status, String title, Long applicantId) {
        // 검색 로직도 Review.Decision을 기준으로 동작하도록 수정이 필요합니다.
        Review.Decision decision = status != null && !status.isBlank() 
            ? Review.Decision.valueOf(status.toUpperCase()) 
            : null;
            
        return reviewRepository.searchReviews(examinerId, decision, title, applicantId);
    }
}
