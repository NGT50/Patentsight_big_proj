package com.patentsight.ai.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class AiCheckRequest {
    private String title;

    // JSON의 key는 'technicalField'인데 Java 변수명은 다르게 하고 싶을 때 사용
    @JsonProperty("technicalField")
    private String technicalField;

    @JsonProperty("backgroundTechnology")
    private String backgroundTechnology;

    @JsonProperty("inventionDetails")
    private InventionDetails inventionDetails;

    private String summary;

    @JsonProperty("drawingDescription")
    private String drawingDescription;

    private List<String> claims;

    // 중첩된 JSON 객체를 위한 내부 클래스
    @Getter
    @Setter
    @NoArgsConstructor
    public static class InventionDetails {
        private String problemToSolve;
        private String solution;
        private String effect;
    }
}