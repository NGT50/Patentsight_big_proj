package com.patentsight.backend.review.repository;

import com.patentsight.backend.review.domain.OpinionNotice;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OpinionNoticeRepository extends JpaRepository<OpinionNotice, Long> {
    List<OpinionNotice> findByReviewReviewId(Long reviewId);
}
