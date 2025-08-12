package com.patentsight.review.service;

import com.patentsight.patent.domain.Patent;
import com.patentsight.patent.domain.PatentStatus;
import com.patentsight.patent.repository.PatentRepository;
import com.patentsight.review.domain.Review;
import com.patentsight.review.dto.*;
import com.patentsight.review.repository.ReviewRepository;
import com.patentsight.review.domain.OpinionNotice;
import com.patentsight.review.domain.OpinionStatus;
import com.patentsight.review.repository.OpinionNoticeRepository;
import com.patentsight.user.domain.User;
import com.patentsight.user.repository.UserRepository;
import com.patentsight.notification.dto.NotificationRequest;
import com.patentsight.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import com.patentsight.user.domain.DepartmentType;


import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final PatentRepository patentRepository;
    private final UserRepository userRepository;
    private final OpinionNoticeRepository opinionNoticeRepository;

    // ✅ 알림 서비스 주입
    private final NotificationService notificationService;

    // 1️⃣ 심사관 수동 배정
    @Override
    public Review assignReviewer(AssignRequest request) {
        Patent patent = patentRepository.findByApplicationNumber(request.getApplicationNumber())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Patent not found with application number: " + request.getApplicationNumber()));

        User examiner = userRepository.findById(request.getExaminerId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Examiner not found with ID: " + request.getExaminerId()));

        Review review = new Review();
        review.setPatent(patent);
        review.setExaminer(examiner);
        review.setDecision(Review.Decision.PENDING);
        review.setReviewedAt(null);
        review.setAutoAssigned(false);

        Review savedReview = reviewRepository.save(review);

        OpinionNotice notice = OpinionNotice.builder()
                .review(savedReview)
                .type(null)
                .status(OpinionStatus.NOT_STARTED)
                .content(null)
                .structuredContent(null)
                .isAiDrafted(false)
                .createdAt(LocalDateTime.now())
                .build();
        opinionNoticeRepository.save(notice);

        // 🔔 알림 생성 - 심사관
        notificationService.createNotification(NotificationRequest.builder()
                .userId(examiner.getUserId())
                .notificationType("REVIEW_ASSIGNED")
                .message("심사 건이 배정되었습니다: " + patent.getTitle())
                .targetType("REVIEW")
                .targetId(savedReview.getReviewId())
                .build()
        );

        return savedReview;
    }
    // 2️⃣ 자동 배정 (전문분야 + 최소 업무량 기준, 없으면 대기 상태)
    @Override
    public void autoAssignWithSpecialty(Patent patent) {
        Optional<User> examinerOpt = userRepository.findTopByDepartmentOrderByCurrentLoadAsc(
                DepartmentType.valueOf(patent.getType().name())
        ); // ✅ 세미콜론 누락 주의

        if (examinerOpt.isEmpty()) {
            patent.setStatus(PatentStatus.WAITING_ASSIGNMENT);
            patentRepository.save(patent);
            return;
        }

        User examiner = examinerOpt.get();

        Review review = new Review();
        review.setPatent(patent);
        review.setExaminer(examiner);
        review.setDecision(Review.Decision.PENDING);
        review.setAutoAssigned(true);

        reviewRepository.save(review);

        examiner.setCurrentLoad(examiner.getCurrentLoad() + 1);
        userRepository.save(examiner);

        OpinionNotice notice = OpinionNotice.builder()
                .review(review)
                .status(OpinionStatus.NOT_STARTED)
                .isAiDrafted(false)
                .createdAt(LocalDateTime.now())
                .build();
        opinionNoticeRepository.save(notice);

        notificationService.createNotification(NotificationRequest.builder()
                .userId(examiner.getUserId())
                .notificationType("REVIEW_ASSIGNED")
                .message("심사 건이 자동 배정되었습니다: " + patent.getTitle())
                .targetType("REVIEW")
                .targetId(review.getReviewId())
                .build()
        );
    }


    // 3️⃣ 심사 목록 조회
    @Override
    public List<ReviewListResponse> getReviewList(Long userId, String status) {
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
                        .status(convertToPatentStatus(r.getDecision()).name())
                        .build())
                .collect(Collectors.toList());
    }

    private PatentStatus convertToPatentStatus(Review.Decision decision) {
        return switch (decision) {
            case PENDING -> PatentStatus.REVIEWING;
            case APPROVE -> PatentStatus.APPROVED;
            case REJECT -> PatentStatus.REJECTED;
        };
    }

    private String getApplicantName(Long applicantId) {
        return userRepository.findById(applicantId)
                .map(User::getName)
                .orElse("");
    }

    // 4️⃣ 심사 상세 조회
    @Override
    public ReviewDetailResponse getReviewDetail(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "리뷰를 찾을 수 없습니다."));
        Patent patent = review.getPatent();
        User examiner = review.getExaminer();
        String applicantName = getApplicantName(patent.getApplicantId());

        return ReviewDetailResponse.builder()
                .reviewId(review.getReviewId())
                .patentId(patent.getPatentId())
                .title(patent.getTitle())
                .applicantName(applicantName)
                .inventor(patent.getInventor())
                .applicationNumber(patent.getApplicationNumber())
                .applicationDate(patent.getSubmittedAt().toLocalDate())
                .technicalField(patent.getTechnicalField())
                .backgroundTechnology(patent.getBackgroundTechnology())
                .problemToSolve(patent.getProblemToSolve())
                .solution(patent.getSolution())
                .effect(patent.getEffect())
                .summary(patent.getSummary())
                .drawingDescription(patent.getDrawingDescription())
                .claims(patent.getClaims())
                .applicationContent(generateApplicationContent(patent))
                .cpc(patent.getCpc())
                .reviewStatus(patent.getStatus().name())
                .examinerName(examiner.getName())
                .decision(review.getDecision())
                .comment(review.getComment())
                .reviewedAt(review.getReviewedAt())
                .aiChecks(List.of())
                .build();
    }

    private String generateApplicationContent(Patent patent) {
        return "기술분야: " + patent.getTechnicalField() + "\n"
                + "배경기술: " + patent.getBackgroundTechnology() + "\n"
                + "해결 과제: " + patent.getProblemToSolve() + "\n"
                + "해결 수단: " + patent.getSolution() + "\n"
                + "기대 효과: " + patent.getEffect() + "\n"
                + "도면 설명: " + patent.getDrawingDescription() + "\n"
                + "요약: " + patent.getSummary() + "\n"
                + "청구항 수: " + (patent.getClaims() != null ? patent.getClaims().size() : 0) + "개";
    }

    // 5️⃣ 심사 결과 제출
    @Override
    public Review submitReview(SubmitReviewRequest request) {
        Review review = reviewRepository.findByPatent_PatentId(request.getPatentId())
                .orElseThrow(() -> new IllegalArgumentException("Review not found"));

        review.setDecision(Review.Decision.valueOf(request.getDecision().toUpperCase()));
        review.setComment(request.getComment());
        review.setReviewedAt(LocalDateTime.now());

        Review updatedReview = reviewRepository.save(review);

        // 🔔 알림 생성 - 출원인
        if (review.getPatent().getApplicantId() != null) {
            notificationService.createNotification(NotificationRequest.builder()
                    .userId(review.getPatent().getApplicantId())
                    .notificationType("REVIEW_RESULT")
                    .message("심사 결과가 등록되었습니다: " + review.getDecision().name())
                    .targetType("REVIEW")
                    .targetId(updatedReview.getReviewId())
                    .build()
            );
        }

        return updatedReview;
    }

    // 6️⃣ 심사관별 대시보드 요약
    @Override
    public DashboardResponse getDashboard(Long userId) {
        List<Review> reviews = reviewRepository.findByExaminer_UserId(userId);

        long total = reviews.size();
        long reviewing = reviews.stream().filter(r -> r.getDecision() == Review.Decision.PENDING).count();
        long completed = reviews.stream().filter(r -> r.getDecision() != Review.Decision.PENDING).count();
        long pending = 0;

        return DashboardResponse.builder()
                .total(total)
                .inReview(reviewing)
                .pending(pending)
                .completed(completed)
                .build();
    }

    // 7️⃣ 최근 활동
    @Override
    public List<RecentActivityResponse> getRecentActivities() {
        return List.of();
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
