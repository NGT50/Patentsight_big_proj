package com.patentsight.backend.review.controller;

import com.patentsight.backend.review.domain.Review;
import com.patentsight.backend.review.service.ReviewService;
import com.patentsight.backend.user.domain.User;
import com.patentsight.backend.patent.domain.Patent;
import com.patentsight.backend.user.repository.UserRepository;
import com.patentsight.backend.patent.repository.PatentRepository;
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
