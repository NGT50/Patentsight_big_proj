package com.patentsight.ai.service.impl;

import com.patentsight.ai.dto.ImageSearchResponse;
import com.patentsight.ai.service.SearchService;
import com.patentsight.ai.util.SearchApiClient;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class SearchServiceImpl implements SearchService {

    private final SearchApiClient searchApiClient;

    // --- 기존 상표 검색 메소드들 ---
    @Override
    public ImageSearchResponse searchTrademarkByImage(MultipartFile file) {
        return searchApiClient.searchTrademarkByImage(file);
    }
    @Override
    public ImageSearchResponse searchTrademarkByText(String text) {
        return searchApiClient.searchTrademarkByText(text);
    }

    // --- 아래에 디자인 검색 메소드 2개 구현 추가 ---
    @Override
    public ImageSearchResponse searchDesignByImage(MultipartFile file) {
        return searchApiClient.searchDesignByImage(file);
    }

    @Override
    public ImageSearchResponse searchDesignByText(String text) {
        return searchApiClient.searchDesignByText(text);
    }
}