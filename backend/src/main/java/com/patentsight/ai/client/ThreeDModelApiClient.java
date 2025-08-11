package com.patentsight.ai.client;

import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.buffer.DataBufferUtils;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.reactive.function.BodyExtractors;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import com.patentsight.ai.dto.Generate3DModelApiResponse;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Optional;
import java.util.UUID;

@Component
public class ThreeDModelApiClient {
    private final WebClient webClient;

    private static final MediaType GLB = MediaType.parseMediaType("model/gltf-binary");

    public ThreeDModelApiClient(WebClient.Builder builder) {
        this.webClient = builder.baseUrl("https://778efa9bea99.ngrok-free.app").build();
    }

    public Mono<Path> generate(Path imagePath, Path saveDir) {
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
                .accept(GLB, MediaType.APPLICATION_OCTET_STREAM, MediaType.APPLICATION_JSON)
                .exchangeToMono(response -> {
                    MediaType contentType = response.headers().contentType()
                            .orElse(MediaType.APPLICATION_OCTET_STREAM);

                    if (MediaType.APPLICATION_JSON.isCompatibleWith(contentType)) {
                        return response.bodyToMono(Generate3DModelApiResponse.class)
                                .flatMap(r -> Mono.error(new IllegalStateException("JSON response not expected")));
                    }

                    if (GLB.isCompatibleWith(contentType) || MediaType.APPLICATION_OCTET_STREAM.isCompatibleWith(contentType)) {
                        String filename = extractFilename(response.headers().asHttpHeaders())
                                .orElse("model-" + UUID.randomUUID() + ".glb");
                        try {
                            Files.createDirectories(saveDir);
                        } catch (Exception ignored) {
                        }
                        Path target = saveDir.resolve(filename);
                        return response.body(BodyExtractors.toDataBuffers())
                                .as(data -> DataBufferUtils.write(data, target))
                                .then(Mono.just(target));
                    }

                    return response.createException().flatMap(Mono::error);
                });
    }

    private Optional<String> extractFilename(HttpHeaders headers) {
        return Optional.ofNullable(headers.getFirst(HttpHeaders.CONTENT_DISPOSITION))
                .flatMap(cd -> {
                    int idx = cd.indexOf("filename=");
                    if (idx < 0) return Optional.empty();
                    String fn = cd.substring(idx + 9).replace("\"", "").trim();
                    return Optional.of(fn.isEmpty() ? null : fn);
                });
    }
}
