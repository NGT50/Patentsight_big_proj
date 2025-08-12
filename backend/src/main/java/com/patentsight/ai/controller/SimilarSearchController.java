package com.patentsight.ai.controller;

import com.patentsight.ai.util.SimilarSearchApiClient;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/search")
public class SimilarSearchController {

    private final SimilarSearchApiClient client;

    /**
     * 프론트용 프록시: FastAPI 서버에서 검색 결과를 받아 그대로 전달
     * 예: GET /api/search/similar?query=핸드폰&top_n=5
     */
    @GetMapping(value = "/similar", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> searchSimilar(
            @RequestParam("query") String query,
            @RequestParam(name = "top_n", defaultValue = "10") int topN
    ) {
        if (query == null || query.isBlank()) {
            return ResponseEntity.badRequest().body("{\"error\":\"empty_query\"}");
        }
        String raw = client.searchRaw(query, topN);
        return ResponseEntity.ok(raw);
    }
}
