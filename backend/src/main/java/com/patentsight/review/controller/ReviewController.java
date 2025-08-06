package com.patentsight.review.controller;

import com.patentsight.review.domain.Review;
import com.patentsight.review.dto.ReviewListResponse;
import com.patentsight.review.dto.AssignRequest;
import com.patentsight.review.dto.ReviewSearchResponse;
import com.patentsight.review.repository.ReviewRepository;
import com.patentsight.review.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.patentsight.review.dto.ReviewResponse;


import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;
    private final ReviewRepository reviewRepository;

    /** 1️⃣ 수동 배정 */
    @PostMapping("/assign")
    public ResponseEntity<ReviewResponse> assignReviewer(@RequestBody AssignRequest request) {
        Review review = reviewService.assignReviewer(request);
        return ResponseEntity.ok(new ReviewResponse(review));
    }

    /** 2️⃣ 전체 출원 단위 자동 배정 (기본 정보만 반환) */
    @PostMapping("/assign/auto")
    public ResponseEntity<List<ReviewResponse>> autoAssign(@RequestParam("type") String type) {
        List<Review> assignedReviews = reviewService.autoAssign(type);

        if (assignedReviews.isEmpty()) {
            return ResponseEntity.noContent().build();
        }

        List<ReviewResponse> response = assignedReviews.stream()
                .map(ReviewResponse::new)
                .toList();

        return ResponseEntity.ok(response);
    }

    /** 3️⃣ 심사 목록 검색 */
    @GetMapping("/search/{examinerId}")
    public ResponseEntity<List<ReviewSearchResponse>> searchReviews(
            @PathVariable Long examinerId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) Long applicantId
    ) {
        List<ReviewSearchResponse> results = reviewRepository.searchReviews(
                examinerId,
                (status != null && !status.isBlank()) ? Review.Decision.valueOf(status) : null,
                title,
                applicantId
        );

        if (results.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(results);
    }

    /** 4️⃣ 심사관 전용 심사 목록 조회 */
    @GetMapping("/list/{userId}")
    public ResponseEntity<List<ReviewListResponse>> getReviewList(
            @PathVariable Long userId,
            @RequestParam(required = false) String status
    ) {
        List<Review> reviews = reviewService.getReviewList(userId, status);

        if (reviews.isEmpty()) {
            return ResponseEntity.noContent().build();
        }

        // Entity → DTO 변환
        List<ReviewListResponse> response = reviews.stream()
                .map(review -> new ReviewListResponse(
                        review.getReviewId(),
                        review.getPatent().getTitle(),
                        review.getDecision().name()
                ))
                .toList();

        return ResponseEntity.ok(response);
    }

}
