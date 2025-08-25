package com.patentsight.ai.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import java.util.List;

@Data // @Getter, @Setter, @ToString 등을 모두 포함
@JsonIgnoreProperties(ignoreUnknown = true)
public class ImageSearchResponse {

    private List<SearchResult> results;

    // input_image 필드는 응답 구조에 따라 추가하거나 생략할 수 있습니다.
    private String input_image;

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class SearchResult {
        private String application_number;
        private double similarity;
        private String title;
        private String applicant;
        private String image_url;
    }
}