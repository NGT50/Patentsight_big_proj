package com.patentsight.ai.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data // @Getter, @Setter 등을 자동으로 생성
@NoArgsConstructor // 기본 생성자 추가
@AllArgsConstructor // 모든 필드를 포함하는 생성자 추가
public class ImageSimilarityRequest {
    private Long patentId;

    @JsonProperty("image_ids") // JSON 필드 "image_ids"를 DTO 필드 imageIds에 매핑
    private List<String> imageIds;
}