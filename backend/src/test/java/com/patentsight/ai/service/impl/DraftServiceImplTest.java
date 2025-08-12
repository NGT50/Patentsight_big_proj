package com.patentsight.ai.service.impl;

import com.patentsight.ai.client.ClaimDraftApiClient;
import com.patentsight.ai.dto.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import reactor.core.publisher.Mono;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DraftServiceImplTest {

    @Mock
    private ClaimDraftApiClient apiClient;

    @InjectMocks
    private DraftServiceImpl service;

    @Test
    void generateClaimDraftReturnsMappedFields() {
        ClaimDraftRequest req = new ClaimDraftRequest();
        req.setQuery("test");
        req.setTopK(5);

        ClaimDraftApiResponse apiRes = new ClaimDraftApiResponse();
        apiRes.setRagContext(List.of());
        Map<String, Object> parsed = new HashMap<>();
        parsed.put("발명의 명칭", "title");
        parsed.put("요약", "summary");
        parsed.put("기술 분야", "tech");
        parsed.put("배경 기술", "background");
        parsed.put("해결하려는 과제", "problem");
        parsed.put("과제의 해결 수단", "solution");
        parsed.put("발명의 효과", "effect");
        parsed.put("청구항", "[청구항 1] c1\n\n[청구항 2] c2");
        apiRes.setSectionsParsed(parsed);
        when(apiClient.generate(req)).thenReturn(Mono.just(apiRes));

        DraftResponse res = service.generateClaimDraft(req);

        assertNotNull(res.getLogId());
        assertEquals("title", res.getTitle());
        assertEquals("summary", res.getSummary());
        assertEquals("tech", res.getTechnicalField());
        assertEquals("background", res.getBackgroundTechnology());
        assertEquals("problem", res.getInventionDetails().getProblemToSolve());
        assertEquals("solution", res.getInventionDetails().getSolution());
        assertEquals("effect", res.getInventionDetails().getEffect());
        assertEquals(List.of("[청구항 1] c1", "[청구항 2] c2"), res.getClaims());
    }
}
