package com.patentsight.ai.util;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.patentsight.ai.dto.Generate3DModelApiResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class ThreeDModelApiClient {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final String endpoint;
    private final Path saveDir;

    public ThreeDModelApiClient(RestTemplate restTemplate,
                                @Value("${ai.3d-model.endpoint:https://778efa9bea99.ngrok-free.app/generate}") String endpoint,
                                @Value("${ai.3d-model.save-dir:uploads}") String saveDir) {
        this.restTemplate = restTemplate;
        this.endpoint = endpoint;
        this.saveDir = Path.of(saveDir);
    }

    public File generate(String imagePath) {
        try {
            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", new FileSystemResource(imagePath));
            body.add("octree_resolution", "256");
            body.add("num_inference_steps", "8");
            body.add("guidance_scale", "5.0");
            body.add("face_count", "40000");
            body.add("texture", "false");

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            HttpEntity<MultiValueMap<String, Object>> entity = new HttpEntity<>(body, headers);
            ResponseEntity<byte[]> res = restTemplate.exchange(endpoint, HttpMethod.POST, entity, byte[].class);
            MediaType ct = res.getHeaders().getContentType();
            byte[] data = res.getBody();
            if (ct != null && ct.includes(MediaType.APPLICATION_JSON)) {
                String json = new String(data);
                Generate3DModelApiResponse error = objectMapper.readValue(json, Generate3DModelApiResponse.class);
                throw new RuntimeException("3D model API error: " + error.getResultId());
            }

            String disposition = res.getHeaders().getFirst(HttpHeaders.CONTENT_DISPOSITION);
            String filename = "result.glb";
            if (disposition != null) {
                Matcher matcher = Pattern.compile("filename=\"?([^\";]+)\"?").matcher(disposition);
                if (matcher.find()) {
                    filename = matcher.group(1);
                }
            }

            Files.createDirectories(saveDir);
            Path target = saveDir.resolve(filename);
            Files.write(target, data);
            return target.toFile();
        } catch (IOException e) {
            throw new RuntimeException("3D model generation failed", e);
        }
    }
}
