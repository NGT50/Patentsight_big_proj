package com.patentsight.ai.util;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
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
     * 응답 JSON에서 claims 배열만 추출해 하나의 문자열로 합쳐서 반환한다.
     */
    public String extractClaims(String json) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(json);
            JsonNode claims = root.path("claims");
            if (!claims.isArray()) {
                return json; // 예상치 못한 응답 구조인 경우 원본 반환
            }
            StringBuilder sb = new StringBuilder();
            for (JsonNode node : claims) {
                sb.append(node.asText()).append("\n");
            }
            return sb.toString().trim();
        } catch (Exception e) {
            log.warn("Failed to parse claim draft response", e);
            return json;
        }
    }
}

