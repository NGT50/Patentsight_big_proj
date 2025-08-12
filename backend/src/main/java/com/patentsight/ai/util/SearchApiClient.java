package com.patentsight.ai.util;

import com.patentsight.ai.dto.ImageSearchResponse; // <-- 1. DTO 이름 변경됨
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
    private final String FASTAPI_BASE_URL = "http://43.201.66.246:8000";

    /**
     * 이미지로 상표를 검색하는 FastAPI를 호출합니다.
     */
    public ImageSearchResponse searchTrademarkByImage(MultipartFile file) { // <-- 2. 반환 타입 변경됨
        return webClient.post()
                .uri(FASTAPI_BASE_URL + "/search/trademark/image")
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(BodyInserters.fromMultipartData("file", file.getResource()))
                .retrieve()
                .bodyToMono(ImageSearchResponse.class) // <-- 3. DTO 클래스 변경됨
                .block();
    }

    /**
     * 텍스트로 상표를 검색하는 FastAPI를 호출합니다.
     */
    public ImageSearchResponse searchTrademarkByText(String text) { // <-- 2. 반환 타입 변경됨
        MultiValueMap<String, String> formData = new LinkedMultiValueMap<>();
        formData.add("text", text);

        return webClient.post()
                .uri(FASTAPI_BASE_URL + "/search/trademark/text")
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(BodyInserters.fromFormData(formData))
                .retrieve()
                .bodyToMono(ImageSearchResponse.class) // <-- 3. DTO 클래스 변경됨
                .block();
    }

    /**
     * 이미지로 디자인을 검색하는 FastAPI를 호출합니다.
     */
    public ImageSearchResponse searchDesignByImage(MultipartFile file) { // <-- 2. 반환 타입 변경됨
        return webClient.post()
                .uri(FASTAPI_BASE_URL + "/search/design/image")
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(BodyInserters.fromMultipartData("file", file.getResource()))
                .retrieve()
                .bodyToMono(ImageSearchResponse.class) // <-- 3. DTO 클래스 변경됨
                .block();
    }

    /**
     * 텍스트로 디자인을 검색하는 FastAPI를 호출합니다.
     */
    public ImageSearchResponse searchDesignByText(String text) { // <-- 2. 반환 타입 변경됨
        MultiValueMap<String, String> formData = new LinkedMultiValueMap<>();
        formData.add("text", text);

        return webClient.post()
                .uri(FASTAPI_BASE_URL + "/search/design/text")
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(BodyInserters.fromFormData(formData))
                .retrieve()
                .bodyToMono(ImageSearchResponse.class) // <-- 3. DTO 클래스 변경됨
                .block();
    }
}