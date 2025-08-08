package com.patentsight.ai.controller;

import com.patentsight.ai.dto.*;
import com.patentsight.ai.service.SearchService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/search")
public class AiSearchController {

    private final SearchService searchService;

    public AiSearchController(SearchService searchService) {
        this.searchService = searchService;
    }

    @PostMapping("/similar")
    public ResponseEntity<List<SearchResultResponse>> searchSimilarPatent(
            @RequestBody SimilarSearchRequest request) {
        return ResponseEntity.ok(searchService.searchSimilarPatent(request));
    }

    @PostMapping("/results/{resultId}/feedback")
    public ResponseEntity<Void> submitFeedback(
            @PathVariable String resultId,
            @RequestBody FeedbackRequest request) {
        searchService.submitFeedback(resultId, request);
        return ResponseEntity.ok().build();
    }
}
