package com.patentsight.review.controller;

import com.patentsight.review.domain.Review;
import com.patentsight.review.dto.AssignRequest;
import com.patentsight.review.dto.ReviewListResponse;
import com.patentsight.review.dto.ReviewSearchResponse;
import com.patentsight.review.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    // 🔹 1. 수동 심사관 배정
    @PostMapping("/assign")
    public Review assignReviewer(@RequestBody AssignRequest request) {
        return reviewService.assignReviewer(request);
    }

    // 🔹 2. 자동 심사관 배정
    @PostMapping("/assign/auto")
    public Review autoAssignReviewer(@RequestParam Long applicantId ) {
        // 요청 예시: POST /api/reviews/assign/auto?applicantId =1
        // 검증: 출원 타입과 동일한 부서의 심사관 중 업무량 최소인 심사관 배정
        return reviewService.autoAssignReviewer(applicantId );
    }

    // 🔹 3. 심사관별 리뷰 목록 조회
    @GetMapping("/list/{examinerId}")
    public List<ReviewListResponse> getReviewList(
            @PathVariable Long examinerId,
            @RequestParam(required = false) String status
    ) {
        // status: PENDING / APPROVE / REJECT
        return reviewService.getReviewList(examinerId, status);
    }

    // 🔹 4. 심사관 전용 심사 목록 검색
    @GetMapping("/search/{examinerId}")
    public List<ReviewSearchResponse> searchReviews(
            @PathVariable Long examinerId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String applicantName,
            @RequestParam(required = false) Long applicantId
    ) {
        // 모든 조건을 OR/AND 조합해서 검색 가능
        return reviewService.searchReviews(examinerId, status, title, applicantName, applicantId);
    }
}
