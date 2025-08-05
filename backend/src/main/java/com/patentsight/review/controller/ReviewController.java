package com.patentsight.review.controller;

import com.patentsight.review.domain.Review;
import com.patentsight.review.dto.AssignRequest;
import com.patentsight.review.dto.ReviewSearchResponse;
import com.patentsight.review.repository.ReviewRepository;
import com.patentsight.review.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;
    private final ReviewRepository reviewRepository;

    // 1️⃣ 수동 배정
    @PostMapping("/assign")
    public Review assignReviewer(@RequestBody AssignRequest request) {
        return reviewService.assignReviewer(request);
    }

    // 2️⃣ 전체 출원 단위 자동 배정
    @PostMapping("/assign/auto")
    public List<Review> autoAssign(@RequestParam("type") String type) {
        return reviewService.autoAssign(type);
    }

    // 3️⃣ 심사 목록 검색
    @GetMapping("/search/{examinerId}")
    public List<ReviewSearchResponse> searchReviews(
            @PathVariable Long examinerId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String title,
//            @RequestParam(required = false) String applicantName,
            @RequestParam(required = false) Long applicantId
    ) {
        return reviewRepository.searchReviews(
                examinerId,
                (status != null && !status.isBlank()) ? Review.Decision.valueOf(status) : null,
                title,
//                applicantName,
                applicantId
        );
    }
}
