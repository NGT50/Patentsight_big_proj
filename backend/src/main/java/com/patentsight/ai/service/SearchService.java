package com.patentsight.ai.service;

import com.patentsight.ai.dto.SearchResultResponse;
import com.patentsight.ai.dto.SimilarSearchRequest;
import com.patentsight.ai.dto.FeedbackRequest;

import java.util.List;

public interface SearchService {

    List<SearchResultResponse> searchSimilarPatent(SimilarSearchRequest request);

    void submitFeedback(String resultId, FeedbackRequest request);
}
