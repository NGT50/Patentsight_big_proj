package com.patentsight.config;


import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.List;

/**
 * Global CORS setup ensuring preflight requests receive the expected headers
 * before Spring Security evaluates them.
 */
@Configuration
public class CorsConfig {

    private static final List<String> ALLOWED_ORIGINS =
            List.of("http://35.175.253.22:3000", "http://35.175.253.22:3001");

    private CorsConfiguration buildConfig() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true);
        config.setAllowedOrigins(ALLOWED_ORIGINS);
        config.setAllowedHeaders(List.of("*"));
        config.setAllowedMethods(List.of("*"));
        return config;
    }

    /**
     * Used by Spring Security's {@code http.cors()} support.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", buildConfig());
        return source;
    }

    /**
     * Explicit CORS filter so that non-Security components (e.g. error pages)
     * also return the necessary headers.
     */
    @Bean
    public FilterRegistrationBean<CorsFilter> corsFilter() {
        FilterRegistrationBean<CorsFilter> bean =
                new FilterRegistrationBean<>(new CorsFilter(corsConfigurationSource()));
        bean.setOrder(Ordered.HIGHEST_PRECEDENCE);
        return bean;
    }
}
