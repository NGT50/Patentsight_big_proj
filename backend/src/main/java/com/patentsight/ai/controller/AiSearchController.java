package com.patentsight.ai.controller;

import com.patentsight.ai.dto.ImageSearchResponse;
import com.patentsight.ai.service.SearchService;
import lombok.RequiredArgsConstructor;

import java.net.SocketTimeoutException;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.client.WebClientRequestException;

@RestController
// 기본 주소를 /api/ai/search로 더 넓게 잡습니다.
@RequestMapping("/api/ai/search")
@RequiredArgsConstructor
public class AiSearchController {

    private final SearchService searchService;

    // --- 기존 상표 검색 API ---
    @PostMapping("/trademark/image")
    public ResponseEntity<ImageSearchResponse> searchTrademarkByImage(@RequestParam("file") MultipartFile file) {
        ImageSearchResponse response = searchService.searchTrademarkByImage(file);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/trademark/text")
    public ResponseEntity<ImageSearchResponse> searchTrademarkByText(@RequestParam("text") String text) {
        ImageSearchResponse response = searchService.searchTrademarkByText(text);
        return ResponseEntity.ok(response);
    }

    // --- 아래에 디자인 검색 API 2개 추가 ---

    // AiSearchController.java (발췌)
    @PostMapping("/design/image")
    public ResponseEntity<?> searchDesignByImage(@RequestParam("file") MultipartFile file) {
    try {
        return ResponseEntity.ok(searchService.searchDesignByImage(file));
    } catch (WebClientRequestException e) {
        if (e.getCause() instanceof SocketTimeoutException) {
        return ResponseEntity.status(504).body(Map.of("error","Upstream timeout (external search)"));
        }
        return ResponseEntity.badRequest().body(Map.of("error","External request failed","detail",e.getMessage()));
    } catch (Exception e) {
        return ResponseEntity.internalServerError().body(Map.of("error","Internal error","detail",e.getMessage()));
    }
    }


    @PostMapping("/design/text")
    public ResponseEntity<ImageSearchResponse> searchDesignByText(@RequestParam("text") String text) {
        ImageSearchResponse response = searchService.searchDesignByText(text);
        return ResponseEntity.ok(response);
    }
}