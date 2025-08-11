package com.patentsight.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class AppConfig {

    // RestTemplate 설정만 남겨둡니다.
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}