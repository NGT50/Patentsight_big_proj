package com.patentsight.global.util;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Exception;

/**
 * Utility helpers for storing uploaded files. Instead of writing to the local
 * file system this implementation stores objects in Amazon S3. The bucket name
 * and region are read from the {@code S3_BUCKET} and {@code AWS_REGION}
 * environment variables (defaults: {@code patentsight-artifacts-usea1} and
 * {@code us-east-1}).
 */
public class FileUtil {

    private static final Logger log = LoggerFactory.getLogger(FileUtil.class);

    private static final String BUCKET = System.getenv().getOrDefault("S3_BUCKET", "patentsight-artifacts-usea1");
    private static final Region REGION = Region.of(System.getenv().getOrDefault("AWS_REGION", "us-east-1"));
    private static final S3Client S3 = S3Client.builder().region(REGION).build();
    private static final boolean USE_S3 = System.getenv("AWS_ACCESS_KEY_ID") != null;

    /**
     * Saves the provided multipart file to S3 and returns the generated object
     * key so it can be stored in the database.
     */
    public static String saveFile(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IOException("No file provided");
        }
        if (!USE_S3) {
            log.warn("AWS credentials not configured; cannot upload file '{}'", file.getOriginalFilename());
            throw new IOException("AWS credentials not configured");
        }
        String key = UUID.randomUUID() + "_" + file.getOriginalFilename();
        try {
            PutObjectRequest req = PutObjectRequest.builder()
                    .bucket(BUCKET)
                    .key(key)
                    .contentType(file.getContentType())
                    .build();
            S3.putObject(req, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
            return key;
        } catch (S3Exception e) {
            throw new IOException("Failed to store file in S3", e);
        }
    }

    /**
     * Removes the S3 object for the given key. This is used when a
     * {@link com.patentsight.file.domain.FileAttachment} is deleted or
     * replaced.
     */
    public static void deleteFile(String key) throws IOException {
        if (key != null && !key.isEmpty()) {
            if (!USE_S3) {
                log.warn("AWS credentials not configured; cannot delete object '{}'", key);
                return;
            }
            try {
                DeleteObjectRequest req = DeleteObjectRequest.builder()
                        .bucket(BUCKET)
                        .key(key)
                        .build();
                S3.deleteObject(req);
            } catch (S3Exception e) {
                throw new IOException("Failed to delete S3 object", e);
            }
        }
    }
}
