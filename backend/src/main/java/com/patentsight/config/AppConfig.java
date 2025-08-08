package com.patentsight.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration // 이 클래스를 설정 파일로 지정합니다.
public class AppConfig {

    @Bean // 이 메서드가 반환하는 객체를 빈으로 등록합니다.
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}