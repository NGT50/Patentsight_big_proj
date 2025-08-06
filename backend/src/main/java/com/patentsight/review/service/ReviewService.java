package com.patentsight.review.service;

import com.patentsight.patent.domain.Patent;
import com.patentsight.patent.domain.PatentStatus;
import com.patentsight.patent.domain.PatentType;
import com.patentsight.patent.repository.PatentRepository;
import com.patentsight.review.domain.Review;
import com.patentsight.review.dto.AssignRequest;
import com.patentsight.review.repository.ReviewRepository;
import com.patentsight.user.domain.User;
import com.patentsight.user.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final PatentRepository patentRepository;
    private final UserRepository userRepository;

    /** 1️⃣ 수동 배정 */
    @Transactional
    public Review assignReviewer(AssignRequest request) {
        Patent patent = patentRepository.findByApplicationNumber(request.getApplicationNumber())
                .orElseThrow(() -> new RuntimeException("Patent not found: " + request.getApplicationNumber()));

        User examiner = userRepository.findById(request.getExaminerId())
                .orElseThrow(() -> new RuntimeException("Examiner not found: " + request.getExaminerId()));

        Review review = new Review();
        review.setPatent(patent);
        review.setExaminer(examiner);
        review.setDecision(Review.Decision.PENDING);
        review.setReviewType(patent.getType());
        review.setAutoAssigned(false);

        patent.setStatus(PatentStatus.REVIEWING);
        patentRepository.save(patent);

        examiner.setCurrentLoad(examiner.getCurrentLoad() + 1);
        userRepository.save(examiner);

        return reviewRepository.save(review);
    }

    /** 2️⃣ 전체 출원 단위 자동 배정 (여러 개 처리 가능) */
    @Transactional
    public List<Review> autoAssign(String type) {
        // 1. 자동 할당 대상(미배정 특허) 조회
        List<Patent> unassigned = patentRepository.findAllUnassignedByType(
                PatentType.valueOf(type),
                PatentStatus.SUBMITTED
        );

        if (unassigned.isEmpty()) {
            return List.of(); // 자동할당 대상 없음
        }

        List<Review> assignedReviews = new ArrayList<>();

        // 2. 여러 건 자동 할당 처리
        for (Patent patent : unassigned) {
            // 심사관 중 가장 부담이 적은 사람 배정
            User examiner = userRepository.findTopByRoleOrderByCurrentLoadAsc("EXAMINER")
                    .orElseThrow(() -> new RuntimeException("No examiner found"));

            // Review 엔티티 생성
            Review review = new Review();
            review.setPatent(patent);
            review.setExaminer(examiner);
            review.setDecision(Review.Decision.PENDING);
            review.setReviewType(patent.getType());
            review.setAutoAssigned(true);
            review.setReviewedAt(LocalDateTime.now()); // 검토 시작 시간 기록

            // 특허 상태 변경
            patent.setStatus(PatentStatus.REVIEWING);
            patentRepository.save(patent);

            // 심사관 업무량 증가
            examiner.setCurrentLoad(examiner.getCurrentLoad() + 1);
            userRepository.save(examiner);

            assignedReviews.add(review);
        }

        // 3. 여러 건 한 번에 저장
        return reviewRepository.saveAll(assignedReviews);
    }

    /** 3️⃣ 심사 목록 조회 */
    @Transactional
    public List<Review> getReviewList(Long userId, String status) {
        if (status == null || status.isBlank()) {
            // 상태 필터 없이 전체 조회
            return reviewRepository.findByExaminer_UserId(userId);
        } else {
            return reviewRepository.findByExaminer_UserIdAndDecision(
                    userId,
                    Review.Decision.valueOf(status)
            );
        }
    }
}
