package com.patentsight.ai.util;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;

import java.io.File;

@Slf4j
@Component
@RequiredArgsConstructor
public class DraftApiClient {

    private final WebClient webClient;

    @Value("${external-api.draft-url}")
    private String fastapiUrl;

    public String requestOpinion(File file) {
        FileSystemResource resource = new FileSystemResource(file);

        return webClient.post()
                .uri(fastapiUrl)
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(BodyInserters.fromMultipartData("file", resource))
                .retrieve()
                .bodyToMono(String.class)
                .map(response -> {
                    // {"opinion": "..."} 응답에서 내용만 파싱
                    int start = response.indexOf(":\"") + 2;
                    int end = response.lastIndexOf("\"");
                    return response.substring(start, end);
                })
                .block();
    }
}
