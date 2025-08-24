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
        // 초기 상태는 SUBMITTED로 설정
        review.setDecision(Review.Decision.SUBMITTED);
        review.setReviewedAt(null);
        review.setAutoAssigned(false);

        // ✅ 4. 저장
        Review savedReview = reviewRepository.save(review);

        // ✅ 5. OpinionNotice 자동 생성 (NOT_STARTED 상태)
        OpinionNotice notice = OpinionNotice.builder()
                .review(savedReview)
                .type(null)                     // 아직 유형 없음
                .status(OpinionStatus.NOT_STARTED) // ✅ 핵심!
                .content(null)                 // 내용 없음
                .structuredContent(null)       // 구조화 없음
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
        // 자동 배정된 리뷰도 초기 상태는 SUBMITTED
        review.setDecision(Review.Decision.SUBMITTED);
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
        // status → Review.Decision 매핑
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
            case REVIEWING -> PatentStatus.REVIEWING;
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
        Patent patent = review.getPatent(); // 특허 정보
        User examiner = review.getExaminer(); // 심사관 정보
        String applicantName = getApplicantName(patent.getApplicantId()); // 출원인 이름 조회

        return ReviewDetailResponse.builder()
                .reviewId(review.getReviewId()) // ✅ Review 객체 기준으로 변경
                .patentId(patent.getPatentId())
                .title(patent.getTitle())
                .applicantName(applicantName)
                .inventor(patent.getInventor())
                .applicationNumber(patent.getApplicationNumber())
                .applicationDate(patent.getSubmittedAt().toLocalDate()) // LocalDateTime → LocalDate 변환
                .technicalField(patent.getTechnicalField())
                .backgroundTechnology(patent.getBackgroundTechnology())
                .problemToSolve(patent.getProblemToSolve())
                .solution(patent.getSolution())
                .effect(patent.getEffect())
                .summary(patent.getSummary())
                .drawingDescription(patent.getDrawingDescription())
                .claims(patent.getClaims())
                .applicationContent(generateApplicationContent(patent)) // ✅ 명세서 요약 조합
                .cpc(patent.getCpc())
                .reviewStatus(patent.getStatus().name()) // PatentStatus 사용
                .examinerName(examiner.getName())
                .decision(review.getDecision())
                .comment(review.getComment())
                .reviewedAt(review.getReviewedAt())
                .aiChecks(List.of()) // 현재 Review에 AI 점검 결과 필드 없음 → 빈 리스트로 처리
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
        Review review;
    
        // 🔸 1. reviewId가 전달되면 그 ID로 Review 조회
        if (request.getReviewId() != null) {
            review = reviewRepository.findById(request.getReviewId())
                    .orElseThrow(() -> new IllegalArgumentException("Review not found"));
        } else {
            // 🔸 2. patentId로 조회했을 때 여러 개면 → 가장 최근 것 선택
            List<Review> reviews = reviewRepository.findByPatent_PatentId(request.getPatentId());
            if (reviews.isEmpty()) {
                throw new IllegalArgumentException("Review not found");
            }
    
            // reviewedAt 기준으로 가장 최근 것 선택
            reviews.sort((a, b) -> {
                LocalDateTime t1 = a.getReviewedAt() != null ? a.getReviewedAt() : LocalDateTime.MIN;
                LocalDateTime t2 = b.getReviewedAt() != null ? b.getReviewedAt() : LocalDateTime.MIN;
                return t1.compareTo(t2);
            });
            review = reviews.get(reviews.size() - 1);
        }
    
        // 🔸 3. Review 상태/코멘트 갱신
        review.setDecision(Review.Decision.valueOf(request.getDecision().toUpperCase()));
        review.setComment(request.getComment());
        review.setReviewedAt(LocalDateTime.now());
    
        // 🔸 4. Review 먼저 저장
        Review updatedReview = reviewRepository.save(review);
    
        // 🔸 5. Patent 다시 조회 후 상태 반영
        Patent patent = patentRepository.findById(updatedReview.getPatent().getPatentId())
                .orElseThrow(() -> new IllegalArgumentException("Patent not found"));
        patent.setStatus(convertToPatentStatus(updatedReview.getDecision()));
        patentRepository.saveAndFlush(patent); // DB에 즉시 반영
    
        // 🔔 알림 로직 유지
        if (patent.getApplicantId() != null) {
            notificationService.createNotification(NotificationRequest.builder()
                    .userId(patent.getApplicantId())
                    .notificationType("REVIEW_RESULT")
                    .message("심사 결과가 등록되었습니다: " + updatedReview.getDecision().name())
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
    
        // 🔹 특허별로 리뷰를 최신 것만 남기기
        var latestReviews = reviews.stream()
                .collect(Collectors.groupingBy(
                        r -> r.getPatent().getPatentId(), // patentId 별로 그룹핑
                        Collectors.collectingAndThen(
                                Collectors.maxBy((a, b) -> {
                                    LocalDateTime t1 = a.getReviewedAt() != null ? a.getReviewedAt() : LocalDateTime.MIN;
                                    LocalDateTime t2 = b.getReviewedAt() != null ? b.getReviewedAt() : LocalDateTime.MIN;
                                    return t1.compareTo(t2);
                                }),
                                Optional::get
                        )
                ))
                .values();
    
        long total = latestReviews.size();
        long inReview = latestReviews.stream().filter(r -> r.getDecision() == Review.Decision.REVIEWING).count();
        long submitted = latestReviews.stream().filter(r -> r.getDecision() == Review.Decision.SUBMITTED).count();
        long completed = latestReviews.stream().filter(r -> r.getDecision() == Review.Decision.APPROVE || r.getDecision() == Review.Decision.REJECT).count();
    
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
