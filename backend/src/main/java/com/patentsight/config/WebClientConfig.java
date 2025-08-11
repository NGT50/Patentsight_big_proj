package com.patentsight.config;

import io.netty.channel.ChannelOption;
import io.netty.handler.timeout.ReadTimeoutHandler;
import io.netty.handler.timeout.WriteTimeoutHandler;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.web.reactive.function.client.ExchangeStrategies;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.netty.http.client.HttpClient;

import java.time.Duration;
import java.util.concurrent.TimeUnit;

@Configuration
public class WebClientConfig {

    private ExchangeStrategies bigBuffer() {
        return ExchangeStrategies.builder()
                .codecs(c -> c.defaultCodecs().maxInMemorySize(10 * 1024 * 1024)) // 10MB
                .build();
    }

    // 🔹 빈 이름을 externalAiWebClient 로 명시
    @Bean(name = "externalAiWebClient")
    public WebClient externalAiWebClient() {
        HttpClient httpClient = HttpClient.create()
                .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, 5000)
                .responseTimeout(Duration.ofMinutes(3))
                .doOnConnected(conn ->
                        conn.addHandlerLast(new ReadTimeoutHandler(180, TimeUnit.SECONDS))
                                .addHandlerLast(new WriteTimeoutHandler(180, TimeUnit.SECONDS))
                );

        return WebClient.builder()
                .exchangeStrategies(bigBuffer())
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .build();
    }
}
