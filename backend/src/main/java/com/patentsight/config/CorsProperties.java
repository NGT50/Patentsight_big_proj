package com.patentsight.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

/**
 * Configuration properties for CORS settings.
 */
@Component
@ConfigurationProperties(prefix = "cors")
public class CorsProperties {

    /**
     * Origins allowed to access the backend. Defaults to "*".
     */
    private List<String> allowedOrigins = new ArrayList<>(Collections.singletonList("*"));

    /**
     * HTTP methods permitted for cross origin requests.
     */
    private List<String> allowedMethods = new ArrayList<>(
            Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));

    /**
     * Headers allowed in cross origin requests.
     */
    private List<String> allowedHeaders = new ArrayList<>(Collections.singletonList("*"));

    public List<String> getAllowedOrigins() {
        return allowedOrigins;
    }

    public void setAllowedOrigins(List<String> allowedOrigins) {
        this.allowedOrigins = allowedOrigins;
    }

    public List<String> getAllowedMethods() {
        return allowedMethods;
    }

    public void setAllowedMethods(List<String> allowedMethods) {
        this.allowedMethods = allowedMethods;
    }

    public List<String> getAllowedHeaders() {
        return allowedHeaders;
    }

    public void setAllowedHeaders(List<String> allowedHeaders) {
        this.allowedHeaders = allowedHeaders;
    }
}
