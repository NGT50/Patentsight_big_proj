package com.patentsight.backend.review.service;

import com.patentsight.backend.review.domain.Review;
import com.patentsight.backend.review.repository.ReviewRepository;
import com.patentsight.backend.user.domain.User;
import com.patentsight.backend.patent.domain.Patent;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;

    public Review assignReviewer(Patent patent, User examiner) {
        Review review = Review.builder()
                .patent(patent)
                .examiner(examiner)
                .decision(Review.Decision.PENDING)
                .build();

        return reviewRepository.save(review);
    }
}
