package com.patentsight.ai.util;

import com.patentsight.ai.dto.AiCheckRequest;
import com.patentsight.ai.dto.AiCheckResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Component
@RequiredArgsConstructor
public class ValidationApiClient {

    private final WebClient webClient;
    private final String VALIDATION_API_URL = "http://3.26.101.212:8000/api/ai/validations";

    public AiCheckResponse requestValidation(AiCheckRequest requestDto) {
        try {
            return webClient.post()
                    .uri(VALIDATION_API_URL)
                    .body(Mono.just(requestDto), AiCheckRequest.class)
                    .retrieve()
                    .bodyToMono(AiCheckResponse.class) // 다시 DTO로 바로 받도록 수정
                    .block();
        } catch (Exception e) {
            System.err.println("FastAPI 서버(WebClient) 호출 중 오류 발생: " + e.getMessage());
            return null;
        }
    }
}