package com.patentsight.review.service;

import com.patentsight.review.domain.Review;
import com.patentsight.review.dto.AssignRequest;
import com.patentsight.review.dto.ReviewListResponse;
import com.patentsight.review.dto.ReviewSearchResponse;
import com.patentsight.review.repository.ReviewRepository;
import com.patentsight.user.domain.User;
import com.patentsight.user.domain.DepartmentType;
import com.patentsight.user.repository.UserRepository;
import com.patentsight.patent.domain.Patent;
import com.patentsight.patent.repository.PatentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final PatentRepository patentRepository;
    // 🔹 1. 수동 심사관 배정 (AssignRequest 그대로 사용)
    public Review assignReviewer(AssignRequest request) {
        // 1. 출원(applicantId) 기준 Patent 조회
        Patent patent = patentRepository.findByApplicantUserId(request.getApplicantId())
                .orElseThrow(() -> new RuntimeException("해당 출원이 존재하지 않습니다."));

        // 2. 심사관 조회
        User examiner = userRepository.findById(request.getExaminerId())
                .orElseThrow(() -> new RuntimeException("Examiner not found"));

        // 3. 역할 및 부서 검증
        if (!"EXAMINER".equalsIgnoreCase(examiner.getRole()) ||
                !examiner.getDepartment().name().equalsIgnoreCase(patent.getType().name())) {
            throw new RuntimeException("출원 타입과 심사관 부서가 일치하지 않습니다.");
        }

        // 4. Review 생성 (수동 배정)
        Review review = Review.builder()
                .patent(patent)
                .examiner(examiner)
                .decision(Review.Decision.PENDING)
                .reviewType(patent.getType().name())
                .autoAssigned(false)
                .build();

        // 5. 심사관 currentLoad 증가
        examiner.setCurrentLoad(examiner.getCurrentLoad() + 1);
        userRepository.save(examiner);

        return reviewRepository.save(review);
    }

    // 🔹 2. 자동 심사관 배정 (applicantId 기준)
    public Review autoAssignReviewer(Long applicantId) {
        // 1. 출원(applicantId) 기준 Patent 조회
        Patent patent = patentRepository.findByApplicantUserId(applicantId)
                .orElseThrow(() -> new RuntimeException("해당 출원이 존재하지 않습니다."));

        // 2. 해당 출원 타입과 부서가 일치하는 심사관 조회
        DepartmentType targetDept = DepartmentType.valueOf(patent.getType().name());
        List<User> examiners = userRepository.findByDepartment(targetDept);

        if (examiners.isEmpty()) {
            throw new RuntimeException("배정 가능한 심사관이 없습니다.");
        }

        // 3. currentLoad가 가장 적은 심사관 선택
        User selectedExaminer = examiners.stream()
                .min(Comparator.comparingInt(User::getCurrentLoad))
                .orElseThrow(() -> new RuntimeException("배정 가능한 심사관이 없습니다."));

        // 4. Review 생성 (자동 배정)
        Review review = Review.builder()
                .patent(patent)
                .examiner(selectedExaminer)
                .decision(Review.Decision.PENDING)
                .reviewType(patent.getType().name())
                .autoAssigned(true)
                .build();

        // 5. 심사관 업무량 증가
        selectedExaminer.setCurrentLoad(selectedExaminer.getCurrentLoad() + 1);
        userRepository.save(selectedExaminer);

        return reviewRepository.save(review);
    }

    // 🔹 3. 심사관별 리뷰 목록 조회
    public List<ReviewListResponse> getReviewList(Long examinerId, String status) {
        List<Review> reviews;

        if (status != null && !status.isEmpty()) {
            Review.Decision decision = Review.Decision.valueOf(status.toUpperCase());
            reviews = reviewRepository.findByExaminerUserIdAndDecision(examinerId, decision);
        } else {
            reviews = reviewRepository.findByExaminerUserId(examinerId);
        }

        return reviews.stream()
                .map(r -> new ReviewListResponse(
                        r.getReviewId(),
                        r.getPatent().getTitle(),
                        r.getDecision().name()
                ))
                .toList();
    }

    // 🔹 4. 심사관 전용 심사 목록 검색
    public List<ReviewSearchResponse> searchReviews(
            Long examinerId,
            String status,
            String title,
            String applicantName,
            Long applicantId
    ) {
        Review.Decision decision = (status != null && !status.isEmpty())
                ? Review.Decision.valueOf(status.toUpperCase())
                : null;

        List<Review> reviews = reviewRepository.searchReviews(
                examinerId, decision, title, applicantName, applicantId
        );

        return reviews.stream()
                .map(r -> new ReviewSearchResponse(
                        r.getReviewId(),
                        r.getPatent().getTitle(),
                        (r.getPatent().getApplicant() != null)
                                ? r.getPatent().getApplicant().getName()
                                : "미확정 출원",
                        r.getDecision().name()
                ))
                .toList();
    }
}
