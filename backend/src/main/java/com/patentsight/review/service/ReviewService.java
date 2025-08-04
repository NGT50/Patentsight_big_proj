package com.patentsight.review.service;

import com.patentsight.review.domain.Review;
import com.patentsight.review.repository.ReviewRepository;
import com.patentsight.user.domain.User;
import com.patentsight.patent.domain.Patent;
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
