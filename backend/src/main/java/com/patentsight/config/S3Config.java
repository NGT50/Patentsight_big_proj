package com.patentsight.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;

@Configuration
public class S3Config {

    @Bean
    public S3Presigner s3Presigner(
            @Value("${aws.region}") String region,
            @Value("${aws.accessKeyId:}") String accessKey,
            @Value("${aws.secretAccessKey:}") String secret
    ) {
        var b = S3Presigner.builder().region(Region.of(region));
        if (!accessKey.isBlank() && !secret.isBlank()) {
            b.credentialsProvider(
                StaticCredentialsProvider.create(AwsBasicCredentials.create(accessKey, secret))
            );
        }
        return b.build();
    }
}
