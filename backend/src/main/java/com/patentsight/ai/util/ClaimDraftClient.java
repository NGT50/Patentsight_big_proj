package com.patentsight.ai.util;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.patentsight.ai.dto.ClaimDraftDetails;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.net.URI;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Component
@RequiredArgsConstructor
public class ClaimDraftClient {

    @Qualifier("externalAiWebClient")
    private final WebClient webClient;

    @Value("${ai.claim-draft.url}")
    private String claimApiUrl;

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
                .uri(URI.create(claimApiUrl + "?minimal=true&include_rag_meta=true&rag_format=meta"))
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
            JsonNode root = mapper.readTree(json);

            ClaimDraftDetails details = new ClaimDraftDetails();
            details.setLogId(root.path("log_id").asText(null));

            // RAG context
            if (root.has("rag_context") && root.get("rag_context").isArray()) {
                List<ClaimDraftDetails.RagContext> contexts = new ArrayList<>();
                for (JsonNode ctx : root.get("rag_context")) {
                    ClaimDraftDetails.RagContext rc = new ClaimDraftDetails.RagContext();
                    if (ctx.has("rank")) rc.setRank(ctx.get("rank").asInt());
                    if (ctx.has("score")) rc.setScore(ctx.get("score").asDouble());
                    rc.setAppNum(ctx.path("app_num").asText(null));
                    if (ctx.has("claim_num")) rc.setClaimNum(ctx.get("claim_num").asInt());
                    rc.setText(ctx.path("text").asText(null));
                    contexts.add(rc);
                }
                details.setRagContext(contexts);
            }

            // Sections
            JsonNode sections = root.path("sections_parsed");
            details.setTitle(sections.path("발명의 명칭").asText(null));
            details.setSummary(sections.path("요약").asText(null));
            details.setTechnicalField(sections.path("기술 분야").asText(null));
            details.setBackgroundTechnology(sections.path("배경 기술").asText(null));

            ClaimDraftDetails.InventionDetails inv = new ClaimDraftDetails.InventionDetails();
            inv.setProblemToSolve(sections.path("해결하려는 과제").asText(null));
            inv.setSolution(sections.path("과제의 해결 수단").asText(null));
            inv.setEffect(sections.path("발명의 효과").asText(null));
            details.setInventionDetails(inv);

            String claimsText = sections.path("청구항").asText("");
            if (!claimsText.isEmpty()) {
                List<String> claims = Arrays.stream(claimsText.split("\\n\\n"))
                        .map(String::trim)
                        .filter(s -> !s.isEmpty())
                        .collect(Collectors.toList());
                details.setClaims(claims);
            }

            return details;
        } catch (Exception e) {
            log.warn("Failed to parse claim draft response", e);
            return new ClaimDraftDetails();
        }
    }
}

