package com.patentsight.ai.service.impl;

import com.patentsight.ai.client.ClaimDraftApiClient;
import com.patentsight.ai.dto.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import reactor.core.publisher.Mono;

import java.util.Collections;
import java.util.HashMap;
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
        apiRes.setRagContext("ctx");
        Map<String, Object> parsed = new HashMap<>();
        parsed.put("청구항", "draft text");
        apiRes.setSectionsParsed(parsed);
        apiRes.setSectionsRaw(Collections.singletonMap("raw", "data"));
        when(apiClient.generate(req)).thenReturn(Mono.just(apiRes));

        DraftResponse res = service.generateClaimDraft(req);

        assertNotNull(res.getLogId());
        assertEquals("draft text", res.getDraftText());
        assertEquals("ctx", res.getRagContext());
        assertEquals(parsed, res.getSectionsParsed());
        assertEquals(apiRes.getSectionsRaw(), res.getSectionsRaw());
    }
}
