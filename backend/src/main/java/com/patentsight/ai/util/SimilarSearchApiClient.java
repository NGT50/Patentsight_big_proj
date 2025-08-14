package com.patentsight.ai.util;

import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.Duration;

/**
 * 유사 특허 검색 모델 서버(FastAPI)를 호출하는 클라이언트
 * - BASE_URL, SEARCH_PATH는 여기서 관리
 * - GET /search?query=...&top_n=... 형태로 요청
 */
@Component
public class SimilarSearchApiClient {

    /** ✅ 여기서 주소를 직접 관리 */
    private static final String BASE_URL    = "http://127.0.0.1:8000"; // FastAPI 서버
    private static final String SEARCH_PATH = "/search";               // 엔드포인트
    private static final long   TIMEOUT_MS  = 5000;

    /** WebClient 생성 */
    private final WebClient webClient = WebClient.builder()
            .baseUrl(BASE_URL)
            .build();

    /**
     * 텍스트 질의로 유사 특허 검색
     * @param query 검색어
     * @param topN  검색할 특허 개수
     * @return FastAPI 서버의 원본 JSON
     */
    public String searchRaw(String query, int topN) {
        return webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path(SEARCH_PATH)
                        .queryParam("query", query)  // 검색어
                        .queryParam("top_n", topN)   // 개수
                        .build())
                .accept(MediaType.APPLICATION_JSON)
                .retrieve()
                .bodyToMono(String.class)
                .timeout(Duration.ofMillis(TIMEOUT_MS))
                .onErrorResume(ex -> {
                    String msg = ex.getMessage() == null ? "unknown" : ex.getMessage().replace("\"", "'");
                    return Mono.just("{\"error\":\"model_call_failed\",\"message\":\"" + msg + "\"}");
                })
                .block();
    }
}
