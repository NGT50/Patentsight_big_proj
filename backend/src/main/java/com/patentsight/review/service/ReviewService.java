package com.patentsight.review.service;

import com.patentsight.review.domain.Review;
import com.patentsight.review.dto.*;

import java.util.List;

public interface ReviewService {

    // 1️⃣ 수동 배정
    Review assignReviewer(AssignRequest request);

    // 2️⃣ 자동 배정
    List<Review> autoAssign(String type);

    // 3️⃣ 심사 목록 조회 (status 필터링 가능)
    List<ReviewListResponse> getReviewList(Long userId, String status);

    // 4️⃣ 심사 상세 조회
    ReviewDetailResponse getReviewDetail(Long reviewId);

    // 5️⃣ 심사 결과 제출
    Review submitReview(SubmitReviewRequest request);

    // 6️⃣ 심사관별 대시보드 요약
    DashboardResponse getDashboard(Long userId);

    // 7️⃣ 최근 활동
    List<RecentActivityResponse> getRecentActivities();

    // 8️⃣ 심사 목록 검색 (고급 검색)
    List<ReviewSearchResponse> searchReviews(Long examinerId, String status, String title, Long applicantId);
}
