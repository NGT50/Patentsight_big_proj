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
        // 출원번호로 특허 조회
        Patent patent = patentRepository.findByApplicationNumber(request.getApplicationNumber())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Patent not found with application number: " + request.getApplicationNumber()));

        // 심사관 조회
        User examiner = userRepository.findById(request.getExaminerId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Examiner not found with ID: " + request.getExaminerId()));

        // Review 생성
        Review review = new Review();
        review.setPatent(patent);
        review.setExaminer(examiner);
        review.setDecision(Review.Decision.PENDING);
        review.setReviewedAt(null);
        review.setAutoAssigned(false);

        return reviewRepository.save(review);
    }

    // 2️⃣ 자동 배정 (아직 미구현)
    @Override
    public List<Review> autoAssign(String type) {
        // TODO: 특허 타입별 자동 배정 로직 구현
        return List.of();
    }

    // 3️⃣ 심사 목록 조회 (status 필터 추가)
    @Override
    public List<ReviewListResponse> getReviewList(Long userId, String status) {
        // status → Review.Decision 매핑
        Review.Decision decisionFilter = null;
        if (status != null && !status.isBlank()) {
            switch (status.toUpperCase()) {
                case "REVIEWING" -> decisionFilter = Review.Decision.PENDING;
                case "APPROVED" -> decisionFilter = Review.Decision.APPROVE;
                case "REJECTED" -> decisionFilter = Review.Decision.REJECT;
            }
        }

        List<Review> reviews = (decisionFilter == null)
                ? reviewRepository.findByExaminer_UserId(userId)
                : reviewRepository.findByExaminer_UserIdAndDecision(userId, decisionFilter);

        return reviews.stream()
                .map(r -> ReviewListResponse.builder()
                        .reviewId(r.getReviewId())
                        .patentTitle(r.getPatent().getTitle())
                        .applicantName(getApplicantName(r.getPatent().getApplicantId()))
                        .examinerName(r.getExaminer().getName())
                        .status(convertToPatentStatus(r.getDecision()).name()) // PatentStatus 기준
                        .build())
                .collect(Collectors.toList());
    }

    // 🔹 Review.Decision → PatentStatus 변환
    private PatentStatus convertToPatentStatus(Review.Decision decision) {
        return switch (decision) {
            case PENDING -> PatentStatus.REVIEWING;
            case APPROVE -> PatentStatus.APPROVED;
            case REJECT -> PatentStatus.REJECTED;
        };
    }

    // 🔹 출원인 이름 조회
    private String getApplicantName(Long applicantId) {
        return userRepository.findById(applicantId)
                .map(User::getName)
                .orElse("");
    }

    // 4️⃣ 심사 상세 조회
    @Override
    public ReviewDetailResponse getReviewDetail(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("Review not found"));

        return ReviewDetailResponse.builder()
                .reviewId(review.getReviewId())
                .patentId(review.getPatent().getPatentId())
                .patentTitle(review.getPatent().getTitle())
                .examinerName(review.getExaminer().getName())
                .decision(review.getDecision())
                .comment(review.getComment())
                .reviewedAt(review.getReviewedAt())
                .summary(review.getPatent().getSummary())
                .claims(review.getPatent().getClaims())
                .aiChecks(List.of()) // TODO: AI 점검 결과 연결 가능
                .build();
    }

    // 5️⃣ 심사 결과 제출
    @Override
    public Review submitReview(SubmitReviewRequest request) {
        Review review = reviewRepository.findByPatent_PatentId(request.getPatentId())
                .orElseThrow(() -> new IllegalArgumentException("Review not found"));

        review.setDecision(Review.Decision.valueOf(request.getDecision().toUpperCase()));
        review.setComment(request.getComment());
        review.setReviewedAt(LocalDateTime.now());

        return reviewRepository.save(review);
    }

    // 6️⃣ 심사관별 대시보드 요약
    @Override
    public DashboardResponse getDashboard(Long userId) {
        List<Review> reviews = reviewRepository.findByExaminer_UserId(userId);

        long total = reviews.size();
        long reviewing = reviews.stream().filter(r -> r.getDecision() == Review.Decision.PENDING).count();
        long completed = reviews.stream().filter(r -> r.getDecision() != Review.Decision.PENDING).count();
        long pending = 0; // SUBMITTED 같은 별도 상태 필요 시 계산

        return DashboardResponse.builder()
                .total(total)
                .inReview(reviewing)
                .pending(pending)
                .completed(completed)
                .build();
    }

    // 7️⃣ 최근 활동 (임시)
    @Override
    public List<RecentActivityResponse> getRecentActivities() {
        return List.of(); // TODO: Activity 테이블 구현 후 조회
    }

    // 8️⃣ 심사 목록 검색
    @Override
    public List<ReviewSearchResponse> searchReviews(Long examinerId, String status, String title, Long applicantId) {
        Review.Decision decision = null;
        if (status != null && !status.isBlank()) {
            decision = Review.Decision.valueOf(status.toUpperCase());
        }
        return reviewRepository.searchReviews(examinerId, decision, title, applicantId);
    }
}
