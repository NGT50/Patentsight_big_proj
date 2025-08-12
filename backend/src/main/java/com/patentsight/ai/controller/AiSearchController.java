package com.patentsight.ai.controller;

<<<<<<< HEAD
import com.patentsight.ai.dto.TrademarkSearchResponse;
import com.patentsight.ai.service.SearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/ai/search/trademark")
@RequiredArgsConstructor
=======
import com.patentsight.ai.dto.*;
import com.patentsight.ai.service.SearchService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/search")
>>>>>>> origin/fix/font_design
public class AiSearchController {

    private final SearchService searchService;

<<<<<<< HEAD
    @PostMapping("/image")
    public ResponseEntity<TrademarkSearchResponse> searchByImage(@RequestParam("file") MultipartFile file) {
        TrademarkSearchResponse response = searchService.searchTrademarkByImage(file);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/text")
    public ResponseEntity<TrademarkSearchResponse> searchByText(@RequestParam("text") String text) {
        TrademarkSearchResponse response = searchService.searchTrademarkByText(text);
        return ResponseEntity.ok(response);
    }
}
=======
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
>>>>>>> origin/fix/font_design
