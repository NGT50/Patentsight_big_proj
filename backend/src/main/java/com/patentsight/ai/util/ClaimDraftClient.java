package com.patentsight.ai.util;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.patentsight.ai.dto.ClaimDraftDetails;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.net.URI;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class ClaimDraftClient {

    @Qualifier("externalAiWebClient")
    private final WebClient webClient;

    private static final String CLAIM_API_URL = "https://neil-gordon-georgia-thumbnail.trycloudflare.com/generate";

    /**
     * 외부 청구항 생성 API 호출 후 raw JSON 응답을 반환한다.
     */
    public String generate(String query, Integer topK) {
        Map<String, Object> body = new HashMap<>();
        body.put("query", query);
        if (topK != null) {
            body.put("top_k", topK);
        }

        String response = webClient.post()
                .uri(URI.create(CLAIM_API_URL + "?minimal=true&include_rag_meta=true&rag_format=meta"))
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(body)
                .retrieve()
                .bodyToMono(String.class)
                .block();

        log.debug("Claim draft response: {}", response);
        return response;
    }

    /**
     * 응답 JSON을 {@link ClaimDraftDetails} 객체로 파싱한다.
     */
    public ClaimDraftDetails parseDetails(String json) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            return mapper.readValue(json, ClaimDraftDetails.class);
        } catch (Exception e) {
            log.warn("Failed to parse claim draft response", e);
            return new ClaimDraftDetails();
        }
    }
}

