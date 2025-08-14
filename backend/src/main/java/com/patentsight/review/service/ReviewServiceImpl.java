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
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

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
    private final OpinionNoticeRepository opinionNoticeRepository;


    // 1️⃣ 심사관 수동 배정
    @Override
    public Review assignReviewer(AssignRequest request) {
        // 1. 출원번호로 특허 조회
        Patent patent = patentRepository.findByApplicationNumber(request.getApplicationNumber())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Patent not found with application number: " + request.getApplicationNumber()));

        // 2. 심사관 조회
        User examiner = userRepository.findById(request.getExaminerId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Examiner not found with ID: " + request.getExaminerId()));

        // 3. Review 생성
        Review review = new Review();
        review.setPatent(patent);
        review.setExaminer(examiner);
        review.setDecision(Review.Decision.SUBMITTED); // PENDING을 SUBMITTED로 변경
        review.setReviewedAt(null);
        review.setAutoAssigned(false);

        // ✅ 4. 저장
        Review savedReview = reviewRepository.save(review);

        // ✅ 5. OpinionNotice 자동 생성 (NOT_STARTED 상태)
        OpinionNotice notice = OpinionNotice.builder()
                .review(savedReview)
                .type(null)
                .status(OpinionStatus.NOT_STARTED)
                .content(null)
                .structuredContent(null)
                .isAiDrafted(false)
                .createdAt(LocalDateTime.now())
                .build();

        opinionNoticeRepository.save(notice); // 저장!

        return savedReview;
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
        Review.Decision decisionFilter = null;
        if (status != null && !status.isBlank()) {
            switch (status.toUpperCase()) {
                case "REVIEWING" -> decisionFilter = Review.Decision.REVIEWING;
                case "APPROVED"  -> decisionFilter = Review.Decision.APPROVE;
                case "REJECTED"  -> decisionFilter = Review.Decision.REJECT;
                case "SUBMITTED" -> decisionFilter = Review.Decision.SUBMITTED;
            }
        }

        List<Review> reviews = (decisionFilter == null)
                ? reviewRepository.findByExaminer_UserId(userId)
                : reviewRepository.findByExaminer_UserIdAndDecision(userId, decisionFilter);

            return reviews.stream().map(r -> {
                var p = r.getPatent();
                return ReviewListResponse.builder()
                    .reviewId(r.getReviewId())
                    .patentTitle(p.getTitle())
                    .applicantName(getApplicantName(p.getApplicantId()))
                    .examinerName(r.getExaminer().getName())
                    .status(r.getDecision().name())
                    .submittedAt(p.getSubmittedAt() != null ? p.getSubmittedAt().toLocalDate() : null) // 리스트 카드에 바로 씀
                    .build();
            }).toList();

    }

    // 🔹 Review.Decision → PatentStatus 변환
    private PatentStatus convertToPatentStatus(Review.Decision decision) {
        return switch (decision) {
            
            case SUBMITTED -> PatentStatus.SUBMITTED;
            case REVIEWING -> PatentStatus.REVIEWING; // PENDING을 SUBMITTED로 변경
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

        return reviewRepository.save(review);
    }

    // 6️⃣ 심사관별 대시보드 요약
    @Override
    public DashboardResponse getDashboard(Long userId) {
        List<Review> reviews = reviewRepository.findByExaminer_UserId(userId);

        long total = reviews.size();
        long inReview = reviews.stream().filter(r -> r.getDecision() == Review.Decision.REVIEWING).count();
        long submitted = reviews.stream().filter(r -> r.getDecision() == Review.Decision.SUBMITTED).count();
        long completed = reviews.stream().filter(r -> r.getDecision() == Review.Decision.APPROVE || r.getDecision() == Review.Decision.REJECT).count();
        
        return DashboardResponse.builder()
                .total(total)
                .inReview(inReview)
                .pending(submitted)
                .completed(completed)
                .build();
    }

    // 7️⃣ 최근 활동 (임시)
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
