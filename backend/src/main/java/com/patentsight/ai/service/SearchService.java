package com.patentsight.ai.service;

import com.patentsight.ai.dto.ImageSearchResponse;
import org.springframework.web.multipart.MultipartFile;

public interface SearchService {
    // 기존 메소드
    ImageSearchResponse searchTrademarkByImage(MultipartFile file);
    ImageSearchResponse searchTrademarkByText(String text);

    // 디자인 검색 메소드 2개 추가
    ImageSearchResponse searchDesignByImage(MultipartFile file);
    ImageSearchResponse searchDesignByText(String text);
}