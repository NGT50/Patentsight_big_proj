package com.patentsight.ai.service.impl;

import com.patentsight.ai.dto.FeedbackRequest;
import com.patentsight.ai.dto.SearchResultResponse;
import com.patentsight.ai.dto.SimilarSearchRequest;
import com.patentsight.ai.service.SearchService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SearchServiceMockImpl implements SearchService {

    @Override
    public List<SearchResultResponse> searchSimilarPatent(SimilarSearchRequest request) {
        return List.of(
                new SearchResultResponse("result-001", "유사특허 A", "G06F", 0.91),
                new SearchResultResponse("result-002", "유사특허 B", "H04N", 0.87)
        );
    }

    @Override
    public void submitFeedback(String resultId, FeedbackRequest request) {
        // 저장 로직은 생략 (mock)
        System.out.println("피드백 저장 완료 → resultId: " + resultId +
                ", helpful: " + request.isHelpful() +
                ", comment: " + request.getComment());
    }
}
