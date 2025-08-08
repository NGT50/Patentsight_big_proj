package com.patentsight.review.repository;

import com.patentsight.review.domain.OpinionNotice;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OpinionNoticeRepository extends JpaRepository<OpinionNotice, Long> {

    // 🔹 특정 Review에 연결된 의견서 목록 조회
    List<OpinionNotice> findByReview_ReviewId(Long reviewId);
}