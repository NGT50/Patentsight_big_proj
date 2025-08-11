package com.patentsight.ai.service;

import com.patentsight.ai.dto.TrademarkSearchResponse;
import org.springframework.web.multipart.MultipartFile;

public interface SearchService {
    TrademarkSearchResponse searchTrademarkByImage(MultipartFile file);
    TrademarkSearchResponse searchTrademarkByText(String text);
}