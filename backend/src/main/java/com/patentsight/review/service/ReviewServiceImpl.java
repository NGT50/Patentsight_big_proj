package com.patentsight.review.service;

import com.patentsight.patent.domain.Patent;
import com.patentsight.patent.domain.PatentStatus;
import com.patentsight.patent.domain.PatentType;
import com.patentsight.patent.dto.PatentResponse; // PatentResponse 임포트
import com.patentsight.patent.repository.PatentRepository;
import com.patentsight.review.domain.Review;
import com.patentsight.review.dto.AssignRequest; // AssignRequest 임포트
import com.patentsight.review.dto.DashboardResponse; // DashboardResponse 임포트
import com.patentsight.review.dto.RecentActivityResponse; // RecentActivityResponse 임포트
import com.patentsight.review.dto.ReviewDetailResponse;
import com.patentsight.review.dto.ReviewListResponse;
import com.patentsight.review.dto.ReviewSearchResponse; // ReviewSearchResponse 임포트
import com.patentsight.review.dto.SubmitReviewRequest; // SubmitReviewRequest 임포트
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

        Review review = new Review();
        review.setPatent(patent);
        review.setExaminer(examiner);
        review.setDecision(Review.Decision.PENDING);
        review.setReviewedAt(null);
        review.setAutoAssigned(false);
        review.setReviewType(patent.getType());

        return reviewRepository.save(review);
    }

    // 2️⃣ 자동 배정 (아직 미구현)
    @Override
    public List<Review> autoAssign(String type) {
        return List.of();
    }

    // 3️⃣ 심사 목록 조회 (status 필터 추가)
    @Override
    public List<ReviewListResponse> getReviewList(Long userId, String status, PatentType reviewType) {
        Review.Decision decisionFilter = null;
        if (status != null && !status.isBlank() && !status.equalsIgnoreCase("all")) {
            try {
                decisionFilter = Review.Decision.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException e) {
                return List.of();
            }
        }

        List<Review> reviews;
        if (decisionFilter == null) {
            reviews = reviewRepository.findByExaminerUserIdAndReviewType(userId, reviewType);
        } else {
            reviews = reviewRepository.findByExaminerUserIdAndReviewTypeAndDecision(userId, reviewType, decisionFilter);
        }

        return reviews.stream()
                .map(r -> ReviewListResponse.builder()
                        .reviewId(r.getReviewId())
                        .patentTitle(r.getPatent() != null ? r.getPatent().getTitle() : "N/A")
                        .applicantName(getApplicantName(r.getPatent() != null ? r.getPatent().getApplicantId() : null))
                        .examinerName(r.getExaminer() != null ? r.getExaminer().getName() : "N/A")
                        .status(convertToPatentStatus(r.getDecision()).name())
                        .receptionDate(r.getPatent() != null && r.getPatent().getSubmittedAt() != null ? r.getPatent().getSubmittedAt().toLocalDate().toString() : "N/A") // ✅ Patent의 submittedAt 사용
                        .field(r.getPatent() != null ? r.getPatent().getTechnicalField() : "N/A") // ✅ Patent의 technicalField 사용
                        .description(r.getComment() != null ? r.getComment() : "N/A")
                        .reviewProgress((int) (Math.random() * 100))
                        .applicationNumber(r.getPatent() != null ? r.getPatent().getApplicationNumber() : "N/A")
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
        if (applicantId == null) return "N/A";
        return userRepository.findById(applicantId)
                .map(User::getName)
                .orElse("N/A");
    }

    // 4️⃣ 심사 상세 조회
    @Override
    public ReviewDetailResponse getReviewDetail(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("Review not found"));
        Patent patent = review.getPatent();
        User applicant = userRepository.findById(patent.getApplicantId())
                .orElseThrow(() -> new IllegalArgumentException("Applicant not found")); // 출원인 정보 없을 시 예외 처리
        User examiner = review.getExaminer();

        // ✅ PatentResponse 객체 생성 및 데이터 채우기 (setter 사용)
        PatentResponse patentResponse = new PatentResponse();
        patentResponse.setPatentId(patent.getPatentId());
        patentResponse.setTitle(patent.getTitle());
        patentResponse.setApplicantId(patent.getApplicantId());
        patentResponse.setApplicationNumber(patent.getApplicationNumber());
        patentResponse.setSummary(patent.getSummary());
        patentResponse.setType(patent.getType());
        patentResponse.setStatus(patent.getStatus());
        
        // Patent 엔티티에 해당 필드가 있다고 가정하고 매핑합니다.
        // 실제 엔티티에 필드가 없다면, null 또는 기본값을 설정하거나 엔티티에 추가해야 합니다.
        patentResponse.setAttachmentIds(List.of()); // 임시 빈 리스트
        patentResponse.setCpc(patent.getCpc() != null ? patent.getCpc() : "N/A"); // ✅ Patent에서 가져옴
        patentResponse.setInventor(patent.getInventor() != null ? patent.getInventor() : "N/A"); // ✅ Patent에서 가져옴
        patentResponse.setTechnicalField(patent.getTechnicalField() != null ? patent.getTechnicalField() : "N/A"); // ✅ Patent에서 가져옴
        patentResponse.setBackgroundTechnology(patent.getBackgroundTechnology() != null ? patent.getBackgroundTechnology() : "N/A"); // ✅ Patent에서 가져옴
        
        // InventionDetails 내부 클래스 설정
        PatentResponse.InventionDetails inventionDetails = new PatentResponse.InventionDetails();
        // Patent 엔티티에 이 상세 정보 필드가 있다면 매핑합니다. (예: patent.getProblemToSolve())
        // 없다면 임시 데이터 또는 null로 설정합니다.
        inventionDetails.setProblemToSolve("정보 과부하 문제 해결 (임시)"); 
        inventionDetails.setSolution("AI 기반 지능형 검색 알고리즘 (임시)");
        inventionDetails.setEffect("검색 정확도 획기적 향상 (임시)");
        patentResponse.setInventionDetails(inventionDetails);

        patentResponse.setDrawingDescription(patent.getDrawingDescription() != null ? patent.getDrawingDescription() : "N/A"); // ✅ Patent에서 가져옴
        patentResponse.setClaims(patent.getClaims() != null ? patent.getClaims() : List.of()); // ✅ Patent에서 가져옴

        // ✅ AI Checks 데이터 임시 추가 (실제 AI 서비스 연동 시 교체)
        List<String> aiChecks = List.of(
            "유사 디자인 분석 결과: 유사도 85%",
            "심미성 평가: 우수함 (AI 점수: 9.2/10)",
            "법적 근거 검토: 디자인보호법 제33조 요건 충족"
        );

        return ReviewDetailResponse.builder()
                .reviewId(review.getReviewId())
                .patentId(patent.getPatentId())
                .patentTitle(patent.getTitle())
                .applicationNumber(patent.getApplicationNumber())
                .applicantName(applicant.getName())
                .examinerName(examiner.getName())
                .decision(review.getDecision().name()) // Enum을 String으로 변환
                .comment(review.getComment())
                .reviewedAt(review.getReviewedAt())
                .claims(patent.getClaims()) // ✅ ReviewDetailResponse의 claims는 Patent의 claims를 직접 사용
                .summary(patent.getSummary())
                .aiChecks(aiChecks)
                .patent(patentResponse) // ✅ PatentResponse 객체 포함
                .build();
    }

    // 5️⃣ 심사 결과 제출
    @Override
    public Review submitReview(SubmitReviewRequest request) {
        Review review = reviewRepository.findByPatent_PatentId(request.getPatentId())
                .orElseThrow(() -> new IllegalArgumentException("Review not found for patent ID: " + request.getPatentId()));

        review.setDecision(Review.Decision.valueOf(request.getDecision().toUpperCase()));
        review.setComment(request.getComment());
        review.setReviewedAt(LocalDateTime.now());

        Review savedReview = reviewRepository.save(review);

        // 특허 상태 업데이트
        Patent patent = savedReview.getPatent();
        // 제출된 결정에 따라 특허 상태를 업데이트합니다.
        // 예를 들어, APPROVE -> APPROVED, REJECT -> REJECTED
        patent.setStatus(PatentStatus.valueOf(request.getDecision().toUpperCase())); 
        patentRepository.save(patent);

        return savedReview; // 업데이트된 Review 객체 반환
    }

    // 6️⃣ 심사관별 대시보드 요약
    @Override
    public DashboardResponse getDashboard(Long userId, PatentType reviewType) {
        List<Review> reviews = reviewRepository.findByExaminerUserIdAndReviewType(userId, reviewType);

        long total = reviews.size();
        // PENDING은 심사 대기/심사 중 상태를 모두 포함할 수 있으므로, 명확하게 분리
        long pendingReviews = reviews.stream().filter(r -> r.getDecision() == Review.Decision.PENDING).count();
        long approvedReviews = reviews.stream().filter(r -> r.getDecision() == Review.Decision.APPROVE).count();
        long rejectedReviews = reviews.stream().filter(r -> r.getDecision() == Review.Decision.REJECT).count();

        LocalDateTime startOfMonth = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
        long thisMonthReceptions = reviews.stream()
                .filter(review -> review.getReviewedAt() != null && review.getReviewedAt().isAfter(startOfMonth))
                .count();

        long sevenDaysOverWaiting = reviews.stream()
                .filter(review -> review.getDecision() == Review.Decision.PENDING &&
                                  review.getReviewedAt() != null && // reviewedAt이 null이 아닌 경우에만 비교
                                  review.getReviewedAt().isBefore(LocalDateTime.now().minusDays(7)))
                .count();

        return DashboardResponse.builder()
                .totalReviews(total)
                .pendingReviews(pendingReviews) // 심사 대기/심사 중
                .thisMonthReceptions(thisMonthReceptions)
                .sevenDaysOverWaiting(sevenDaysOverWaiting)
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

        // ✅ final 변수를 선언하여 람다에서 캡처할 수 있도록 합니다.
        final Review.Decision finalDecision = decision; 

        return reviewRepository.findByExaminer_UserId(examinerId).stream()
            .filter(r -> (finalDecision == null || r.getDecision() == finalDecision) && // ✅ finalDecision 사용
                         (title == null || (r.getPatent() != null && r.getPatent().getTitle() != null && r.getPatent().getTitle().toLowerCase().contains(title.toLowerCase()))) && // ✅ null 체크 추가
                         (applicantId == null || (r.getPatent() != null && r.getPatent().getApplicantId() != null && r.getPatent().getApplicantId().equals(applicantId)))) // ✅ null 체크 추가
            .map(r -> ReviewSearchResponse.builder()
                .reviewId(r.getReviewId())
                .patentTitle(r.getPatent() != null ? r.getPatent().getTitle() : "N/A")
                .status(r.getDecision().name())
                .applicantName(getApplicantName(r.getPatent() != null ? r.getPatent().getApplicantId() : null))
                .reviewType(r.getReviewType())
                .autoAssigned(r.isAutoAssigned())
                .reviewedAt(r.getReviewedAt())
                .build())
            .collect(Collectors.toList());
    }
}
