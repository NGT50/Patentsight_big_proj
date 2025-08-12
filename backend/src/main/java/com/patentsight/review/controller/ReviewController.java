package com.patentsight.review.controller;

import com.patentsight.review.domain.Review;
import com.patentsight.review.dto.*;
import com.patentsight.review.service.OpinionNoticeService;
import com.patentsight.review.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;
    private final OpinionNoticeService opinionNoticeService;

    // 1️⃣ 수동 배정
    @PostMapping("/assign")
    public Review assignReviewer(@RequestBody AssignRequest request) {
        return reviewService.assignReviewer(request);
    }

    // 3️⃣ 심사 목록 조회 (status 필터링 가능)
    @GetMapping("/list/{userId}")
    public List<ReviewListResponse> getReviewList(
            @PathVariable Long userId,
            @RequestParam(required = false) String status
    ) {
        return reviewService.getReviewList(userId, status);
    }

    // 4️⃣ 심사 상세 조회
    @GetMapping("/{reviewId}")
    public ReviewDetailResponse getReviewDetail(@PathVariable Long reviewId) {
        return reviewService.getReviewDetail(reviewId);
    }

    // 5️⃣ 심사 결과 제출
    @PostMapping("/submit")
    public Review submitReview(@RequestBody SubmitReviewRequest request) {
        return reviewService.submitReview(request);
    }

    // 6️⃣ 의견서 작성
    @PostMapping("/{reviewId}/opinion-notices")
    public OpinionNoticeResponse createOpinionNotice(
            @PathVariable Long reviewId,
            @RequestBody OpinionNoticeRequest request
    ) {
        return opinionNoticeService.createOpinionNotice(reviewId, request);
    }

    // 7️⃣ 의견서 목록 조회
    @GetMapping("/{reviewId}/opinion-notices")
    public List<OpinionNoticeResponse> getOpinionNotices(@PathVariable Long reviewId) {
        return opinionNoticeService.getOpinionNotices(reviewId);
    }

    // 8️⃣ 심사관별 대시보드 요약
    @GetMapping("/dashboard/{userId}")
    public DashboardResponse getDashboard(@PathVariable Long userId) {
        return reviewService.getDashboard(userId);
    }

    // 9️⃣ 최근 활동
    @GetMapping("/recent-activities")
    public List<RecentActivityResponse> getRecentActivities() {
        return reviewService.getRecentActivities();
    }

    // 🔟 심사 목록 검색 (고급 검색용)
    @GetMapping("/search/{examinerId}")
    public List<ReviewSearchResponse> searchReviews(
            @PathVariable Long examinerId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) Long applicantId
    ) {
        return reviewService.searchReviews(examinerId, status, title, applicantId);
    }
}
