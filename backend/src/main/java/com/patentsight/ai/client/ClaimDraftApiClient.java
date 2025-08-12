package com.patentsight.ai.client;

import com.patentsight.ai.dto.ClaimDraftApiResponse;
import com.patentsight.ai.dto.ClaimDraftRequest;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Component
public class ClaimDraftApiClient {
    private final WebClient webClient;

    public ClaimDraftApiClient(WebClient.Builder builder) {
        this.webClient = builder
                .baseUrl("https://kw-crossword-experiments-instrumentation.trycloudflare.com")
                .build();
    }

    public Mono<ClaimDraftApiResponse> generate(ClaimDraftRequest request) {
        return webClient.post()
                .uri(uriBuilder -> uriBuilder
                        .path("/generate")
                        .queryParam("minimal", true)
                        .queryParam("include_rag_meta", true)
                        .queryParam("rag_format", "meta")
                        .build())
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(request)
                .retrieve()
                .bodyToMono(ClaimDraftApiResponse.class);
    }
}
