package com.patentsight.review.controller;

import com.patentsight.review.domain.Review;
import com.patentsight.review.service.ReviewService;
import com.patentsight.user.domain.User;
import com.patentsight.patent.domain.Patent;
import com.patentsight.user.repository.UserRepository;
import com.patentsight.patent.repository.PatentRepository;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;
    private final UserRepository userRepository;
    private final PatentRepository patentRepository;

    @PostMapping("/assign")
    public Review assignReviewer(@RequestBody AssignRequest request) {
        Patent patent = patentRepository.findById(request.getPatentId()).orElseThrow();
        User examiner = userRepository.findById(request.getExaminerId()).orElseThrow();

        return reviewService.assignReviewer(patent, examiner);
    }

    @Getter @Setter
    public static class AssignRequest {
        private Long patentId;
        private Long examinerId;
    }
}
