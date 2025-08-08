package com.patentsight.review.service;

import com.patentsight.review.domain.OpinionNotice;
import com.patentsight.review.domain.OpinionType; // 🔹 추가
import com.patentsight.review.domain.Review;
import com.patentsight.review.dto.OpinionNoticeRequest;
import com.patentsight.review.dto.OpinionNoticeResponse;
import com.patentsight.review.repository.OpinionNoticeRepository;
import com.patentsight.review.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OpinionNoticeService {

    private final OpinionNoticeRepository opinionNoticeRepository;
    private final ReviewRepository reviewRepository;

    // 1️⃣ 의견서 생성
    public OpinionNoticeResponse createOpinionNotice(Long reviewId, OpinionNoticeRequest request) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("Review not found"));

        OpinionNotice notice = OpinionNotice.builder()
                .review(review)
                .type(request.getType()) // 🔹 추가
                .content(request.getContent())
                .structuredContent(request.getStructuredContent())
                .isAiDrafted(request.getIsAiDrafted())
                .responseDueDate(request.getResponseDueDate())
                .createdAt(LocalDateTime.now())
                .build();

        OpinionNotice saved = opinionNoticeRepository.save(notice);

        return OpinionNoticeResponse.builder()
                .noticeId(saved.getNoticeId())
                .reviewId(reviewId)
                .type(saved.getType()) // 🔹 추가
                .content(saved.getContent())
                .structuredContent(saved.getStructuredContent())
                .isAiDrafted(saved.getIsAiDrafted())
                .responseDueDate(saved.getResponseDueDate())
                .createdAt(saved.getCreatedAt())
                .status("WAITING")
                .build();
    }

    // 2️⃣ 특정 심사의 의견서 목록 조회
    public List<OpinionNoticeResponse> getOpinionNotices(Long reviewId) {
        List<OpinionNotice> notices = opinionNoticeRepository.findByReview_ReviewId(reviewId);

        return notices.stream()
                .map(n -> OpinionNoticeResponse.builder()
                        .noticeId(n.getNoticeId())
                        .reviewId(n.getReview().getReviewId())
                        .type(n.getType()) // 🔹 추가
                        .content(n.getContent())
                        .structuredContent(n.getStructuredContent())
                        .isAiDrafted(n.getIsAiDrafted())
                        .responseDueDate(n.getResponseDueDate())
                        .createdAt(n.getCreatedAt())
                        .status("WAITING")
                        .build())
                .collect(Collectors.toList());
    }
}
