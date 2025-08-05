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

    /** 2️⃣ 전체 출원 단위 자동 배정 */
    @Transactional
    public List<Review> autoAssign(String type) {
        // 🔹 applicantId 없이 모든 미배정 출원 조회
        List<Patent> unassigned = patentRepository.findAllUnassignedByType(
                PatentType.valueOf(type),
                PatentStatus.SUBMITTED
        );

        List<Review> assigned = new ArrayList<>();
        for (Patent patent : unassigned) {
            User examiner = userRepository.findTopByRoleOrderByCurrentLoadAsc("EXAMINER")
                    .orElseThrow(() -> new RuntimeException("No examiner found"));

            Review review = new Review();
            review.setPatent(patent);
            review.setExaminer(examiner);
            review.setDecision(Review.Decision.PENDING);
            review.setReviewType(patent.getType());
            review.setAutoAssigned(true);

            patent.setStatus(PatentStatus.REVIEWING);
            patentRepository.save(patent);

            examiner.setCurrentLoad(examiner.getCurrentLoad() + 1);
            userRepository.save(examiner);

            assigned.add(reviewRepository.save(review));
        }

        return assigned;
    }
}
