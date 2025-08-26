// backend/src/main/java/com/patentsight/ai/util/SearchApiClient.java
package com.patentsight.ai.util;

import com.patentsight.ai.dto.ImageSearchResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.util.MultiValueMap;
import org.springframework.http.client.MultipartBodyBuilder;
import reactor.core.publisher.Mono;

@Component
@RequiredArgsConstructor
public class SearchApiClient {

    private final @Qualifier("externalAiWebClient") WebClient webClient;

    @Value("${external-api.search-base-url}")
    private String fastapiBaseUrl;

    /* 공통: 멀티파트 생성 */
    private MultiValueMap<String, HttpEntity<?>> buildMultipart(String partName, MultipartFile file) {
        MultipartBodyBuilder mb = new MultipartBodyBuilder();
        String fname = (file.getOriginalFilename() != null && !file.getOriginalFilename().isBlank())
                ? file.getOriginalFilename()
                : "upload.bin";
        MediaType ctype = (file.getContentType() != null) ? MediaType.parseMediaType(file.getContentType())
                : MediaType.APPLICATION_OCTET_STREAM;

        mb.part(partName, file.getResource())
          .filename(fname)
          .contentType(ctype);

        return mb.build();
    }

    private <T> Mono<T> decodeOrError(WebClient.ResponseSpec resp, Class<T> type) {
        // exchangeToMono 를 쓰면 status별 본문을 직접 읽을 수 있음
        return resp.bodyToMono(type);
    }

    /* 디자인 이미지 검색 */
    public ImageSearchResponse searchDesignByImage(MultipartFile file) {
        var multipart = buildMultipart("file", file);

        return webClient.post()
                .uri(fastapiBaseUrl + "/search/design/image")
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(BodyInserters.fromMultipartData(multipart))
                .exchangeToMono(clientResponse -> {
                    if (clientResponse.statusCode().is2xxSuccessful()) {
                        return clientResponse.bodyToMono(ImageSearchResponse.class);
                    }
                    return clientResponse.bodyToMono(String.class)
                            .defaultIfEmpty("")
                            .flatMap(body -> Mono.error(new RuntimeException(
                                    "External API error " + clientResponse.rawStatusCode() + " : " + body)));
                })
                .block();
    }

    /* 상표 이미지 검색 */
    public ImageSearchResponse searchTrademarkByImage(MultipartFile file) {
        var multipart = buildMultipart("file", file);

        return webClient.post()
                .uri(fastapiBaseUrl + "/search/trademark/image")
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(BodyInserters.fromMultipartData(multipart))
                .exchangeToMono(clientResponse -> {
                    if (clientResponse.statusCode().is2xxSuccessful()) {
                        return clientResponse.bodyToMono(ImageSearchResponse.class);
                    }
                    return clientResponse.bodyToMono(String.class)
                            .defaultIfEmpty("")
                            .flatMap(body -> Mono.error(new RuntimeException(
                                    "External API error " + clientResponse.rawStatusCode() + " : " + body)));
                })
                .block();
    }

    /* 디자인 텍스트 검색 */
    public ImageSearchResponse searchDesignByText(String text) {
        return webClient.post()
                .uri(fastapiBaseUrl + "/search/design/text")
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(BodyInserters.fromFormData("text", text))
                .exchangeToMono(clientResponse -> {
                    if (clientResponse.statusCode().is2xxSuccessful()) {
                        return clientResponse.bodyToMono(ImageSearchResponse.class);
                    }
                    return clientResponse.bodyToMono(String.class)
                            .defaultIfEmpty("")
                            .flatMap(body -> Mono.error(new RuntimeException(
                                    "External API error " + clientResponse.rawStatusCode() + " : " + body)));
                })
                .block();
    }

    /* 상표 텍스트 검색 */
    public ImageSearchResponse searchTrademarkByText(String text) {
        return webClient.post()
                .uri(fastapiBaseUrl + "/search/trademark/text")
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(BodyInserters.fromFormData("text", text))
                .exchangeToMono(clientResponse -> {
                    if (clientResponse.statusCode().is2xxSuccessful()) {
                        return clientResponse.bodyToMono(ImageSearchResponse.class);
                    }
                    return clientResponse.bodyToMono(String.class)
                            .defaultIfEmpty("")
                            .flatMap(body -> Mono.error(new RuntimeException(
                                    "External API error " + clientResponse.rawStatusCode() + " : " + body)));
                })
                .block();
    }
}
