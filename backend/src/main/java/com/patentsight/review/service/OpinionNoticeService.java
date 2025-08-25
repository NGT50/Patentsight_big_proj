package com.patentsight.review.service;

import com.patentsight.review.domain.OpinionNotice;
import com.patentsight.review.domain.OpinionType;
import com.patentsight.review.domain.OpinionStatus;
import com.patentsight.review.domain.Review;
import com.patentsight.review.dto.OpinionNoticeRequest;
import com.patentsight.review.dto.OpinionNoticeResponse;
import com.patentsight.review.repository.OpinionNoticeRepository;
import com.patentsight.review.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class OpinionNoticeService {

    private final OpinionNoticeRepository opinionNoticeRepository;
    private final ReviewRepository reviewRepository;
    private final PatentRepository patentRepository;

    // 1️⃣ 의견서 생성
    public OpinionNoticeResponse createOpinionNotice(Long reviewId, OpinionNoticeRequest request) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("Review not found"));

        // ✅ OpinionType에 따라 Review/Patent 상태 동기화
        switch (request.getOpinionType()) {
            case APPROVAL -> review.setDecision(Review.Decision.APPROVE);
            case REJECTION -> review.setDecision(Review.Decision.REJECT);
            case EXAMINER_OPINION -> review.setDecision(Review.Decision.REVIEWING);
        }

        // Review 결정과 특허 상태를 함께 저장
        reviewRepository.save(review);
        OpinionNotice notice = OpinionNotice.builder()
                .review(review)
                .type(request.getOpinionType())
                .content(request.getContent())
                .structuredContent(request.getStructuredContent())
                .isAiDrafted(request.getIsAiDrafted())
                .responseDueDate(request.getResponseDueDate())
                .createdAt(LocalDateTime.now())
                .status(OpinionStatus.SUBMITTED) // or DRAFT
                .build();

        OpinionNotice saved = opinionNoticeRepository.save(notice);

        return OpinionNoticeResponse.builder()
                .noticeId(saved.getNoticeId())
                .reviewId(reviewId)
                .opinionType(saved.getType())
                .content(saved.getContent())
                .structuredContent(saved.getStructuredContent())
                .isAiDrafted(saved.getIsAiDrafted())
                .responseDueDate(saved.getResponseDueDate())
                .createdAt(saved.getCreatedAt())
                .status(saved.getStatus()) // ✅ 수정됨
                .build();
    }

    // 2️⃣ 특정 심사의 의견서 목록 조회
    public List<OpinionNoticeResponse> getOpinionNotices(Long reviewId) {
        List<OpinionNotice> notices = opinionNoticeRepository.findByReview_ReviewId(reviewId);

        return notices.stream()
                .map(n -> OpinionNoticeResponse.builder()
                        .noticeId(n.getNoticeId())
                        .reviewId(n.getReview().getReviewId())
                        .opinionType(n.getType())
                        .content(n.getContent())
                        .structuredContent(n.getStructuredContent())
                        .isAiDrafted(n.getIsAiDrafted())
                        .responseDueDate(n.getResponseDueDate())
                        .createdAt(n.getCreatedAt())
                        .status(n.getStatus())
                        .build())
                .collect(Collectors.toList());
    }
}
