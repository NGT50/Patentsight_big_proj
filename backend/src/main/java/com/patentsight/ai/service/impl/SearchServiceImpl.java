package com.patentsight.ai.service.impl;

import com.patentsight.ai.dto.TrademarkSearchResponse;
import com.patentsight.ai.service.SearchService;
import com.patentsight.ai.util.SearchApiClient;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class SearchServiceImpl implements SearchService {

    private final SearchApiClient searchApiClient;

    @Override
    public TrademarkSearchResponse searchTrademarkByImage(MultipartFile file) {
        return searchApiClient.searchTrademarkByImage(file);
    }

    @Override
    public TrademarkSearchResponse searchTrademarkByText(String text) {
        return searchApiClient.searchTrademarkByText(text);
    }
}