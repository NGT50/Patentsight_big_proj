package com.patentsight.ai.client;

import com.patentsight.ai.dto.Generate3DModelApiResponse;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.nio.file.Path;

@Component
public class ThreeDModelApiClient {
    private final WebClient webClient;

    public ThreeDModelApiClient(WebClient.Builder builder) {
        this.webClient = builder.baseUrl("https://090afeef334a.ngrok-free.app").build();
    }

    public Mono<Generate3DModelApiResponse> generate(Path imagePath) {
        FileSystemResource image = new FileSystemResource(imagePath);
        MultiValueMap<String, Object> form = new LinkedMultiValueMap<>();
        form.add("file", image);
        form.add("octree_resolution", 256);
        form.add("num_inference_steps", 8);
        form.add("guidance_scale", 5.0);
        form.add("face_count", 40000);
        form.add("texture", false);

        return webClient.post()
                .uri("/generate")
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(BodyInserters.fromMultipartData(form))
                .retrieve()
                .bodyToMono(Generate3DModelApiResponse.class);
    }
}
