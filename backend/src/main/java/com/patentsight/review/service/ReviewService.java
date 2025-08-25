package com.patentsight.review.service;

import com.patentsight.patent.domain.Patent;
import com.patentsight.review.domain.Review;
import com.patentsight.review.dto.*;

import java.util.List;

public interface ReviewService {

    // 1️⃣ 수동 배정
    Review assignReviewer(AssignRequest request);

    // 2️⃣ 자동 배정 (전문분야 + 최소 업무량, type만 사용)
    // ✅ 출원서 제출 직후 자동 배정을 위해 추가된 메서드
    void autoAssignWithSpecialty(Patent patent);

    // 3️⃣ 심사 목록 조회
    List<ReviewListResponse> getReviewList(Long userId, String status);

    // 4️⃣ 심사 상세 조회
    ReviewDetailResponse getReviewDetail(Long reviewId);

    // 4-1️⃣ 특정 특허의 최신 심사 결과 조회
    ReviewDetailResponse getLatestReviewByPatent(Long patentId);

    // 5️⃣ 심사 결과 제출
    Review submitReview(SubmitReviewRequest request);

    // 6️⃣ 심사관별 대시보드 요약
    DashboardResponse getDashboard(Long userId);

    // 7️⃣ 최근 활동
    List<RecentActivityResponse> getRecentActivities();

    // 8️⃣ 심사 목록 검색
    List<ReviewSearchResponse> searchReviews(Long examinerId, String status, String title, Long applicantId);
}
