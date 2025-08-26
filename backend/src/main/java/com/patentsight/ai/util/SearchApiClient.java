// backend/src/main/java/com/patentsight/ai/util/SearchApiClient.java
package com.patentsight.ai.util;

import com.patentsight.ai.dto.ImageSearchResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;

@Component
@RequiredArgsConstructor
public class SearchApiClient {

    // 🔹 WebClientConfig에서 만든 외부 호출용 빈을 명시 주입
    private final @Qualifier("externalAiWebClient") WebClient webClient;

    @Value("${external-api.search-base-url}")
    private String fastapiBaseUrl;

    /** 이미지로 상표 검색 */
    public ImageSearchResponse searchTrademarkByImage(MultipartFile file) {
        return webClient.post()
                .uri(fastapiBaseUrl + "/search/trademark/image")
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(BodyInserters.fromMultipartData("file", file.getResource()))
                .retrieve()
                .bodyToMono(ImageSearchResponse.class)
                .block();
    }

    /** 텍스트로 상표 검색 */
    public ImageSearchResponse searchTrademarkByText(String text) {
        return webClient.post()
                .uri(fastapiBaseUrl + "/search/trademark/text")
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(BodyInserters.fromFormData("text", text))
                .retrieve()
                .bodyToMono(ImageSearchResponse.class)
                .block();
    }

    /** 이미지로 디자인 검색 */
    public ImageSearchResponse searchDesignByImage(MultipartFile file) {
        return webClient.post()
                .uri(fastapiBaseUrl + "/search/design/image")
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(BodyInserters.fromMultipartData("file", file.getResource()))
                .retrieve()
                .bodyToMono(ImageSearchResponse.class)
                .block();
    }

    /** 텍스트로 디자인 검색 */
    public ImageSearchResponse searchDesignByText(String text) {
        return webClient.post()
                .uri(fastapiBaseUrl + "/search/design/text")
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(BodyInserters.fromFormData("text", text))
                .retrieve()
                .bodyToMono(ImageSearchResponse.class)
                .block();
    }
}
