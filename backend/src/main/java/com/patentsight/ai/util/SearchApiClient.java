package com.patentsight.ai.util;

import com.patentsight.ai.dto.TrademarkSearchResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;

@Component
@RequiredArgsConstructor
public class SearchApiClient {

    private final WebClient webClient;

    // 알려주신 서버 주소로 수정했습니다.
    private final String FASTAPI_SEARCH_URL = "http://43.201.66.246:8000/search/trademark";

    /**
     * 이미지로 상표를 검색하는 FastAPI를 호출합니다.
     */
    public TrademarkSearchResponse searchTrademarkByImage(MultipartFile file) {
        return webClient.post()
                .uri(FASTAPI_SEARCH_URL + "/image")
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(BodyInserters.fromMultipartData("file", file.getResource()))
                .retrieve()
                .bodyToMono(TrademarkSearchResponse.class)
                .block();
    }

    /**
     * 텍스트로 상표를 검색하는 FastAPI를 호출합니다.
     */
    public TrademarkSearchResponse searchTrademarkByText(String text) {
        MultiValueMap<String, String> formData = new LinkedMultiValueMap<>();
        formData.add("text", text);

        return webClient.post()
                .uri(FASTAPI_SEARCH_URL + "/text")
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(BodyInserters.fromFormData(formData))
                .retrieve()
                .bodyToMono(TrademarkSearchResponse.class)
                .block();
    }
}