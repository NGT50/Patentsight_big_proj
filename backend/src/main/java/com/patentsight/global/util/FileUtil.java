package com.patentsight.global.util;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.core.exception.SdkClientException;

import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;

import java.time.Duration;

/**
 * Utility helpers for storing uploaded files. The primary storage target is
 * Amazon S3. When S3 operations fail, an {@link IOException} is thrown so the
 * caller can handle the error instead of silently falling back to the local
 * file system.
 */
public class FileUtil {

    private static final Logger log = LoggerFactory.getLogger(FileUtil.class);

    // Default bucket where files are stored. Mirrors the public bucket used by the frontend.
    private static final String BUCKET =
            System.getenv().getOrDefault("S3_BUCKET", "patentsight-artifacts-usea1");
    /**
     * Resolves the AWS region from {@code AWS_REGION} env var. If the provided value
     * does not match a known region, {@code us-east-1} is used instead so that
     * generated URLs still point to a valid S3 endpoint.
     */
    private static Region resolveRegion() {
        String regionId = System.getenv().getOrDefault("AWS_REGION", "us-east-1");
        return Region.regions().stream()
                .filter(r -> r.id().equals(regionId))
                .findFirst()
                .orElseGet(() -> {
                    log.warn("Unknown AWS region '{}', defaulting to us-east-1", regionId);
                    return Region.US_EAST_1;
                });
    }

    private static final Region REGION = resolveRegion();
    private static final S3Client S3 = S3Client.builder().region(REGION).build();
    private static final S3Presigner PRESIGNER = S3Presigner.builder().region(REGION).build();

    private static void ensureAwsCredentials(String action) throws IOException {
        try {
            DefaultCredentialsProvider.create().resolveCredentials();
        } catch (SdkClientException e) {
            log.warn("AWS credentials not configured; cannot {}", action);
            throw new IOException(e.getMessage(), e);
        }
    }

    /**
     * Saves the provided multipart file to S3 and returns the object key. If the
     * upload fails for any reason, an {@link IOException} is thrown.
     */
    public static String saveFile(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IOException("No file provided");
        }
        String name = UUID.randomUUID() + "_" + file.getOriginalFilename();
        try {
            ensureAwsCredentials("upload file '" + file.getOriginalFilename() + "'");
            PutObjectRequest req = PutObjectRequest.builder()
                    .bucket(BUCKET)
                    .key(name)
                    .contentType(file.getContentType())
                    .build();
            S3.putObject(req, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
            return name;
        } catch (Exception e) {
            String message = "Failed to upload file to S3: " + e.getMessage();
            log.error(message, e);
            throw new IOException(message, e);
        }
    }

    /**
     * Removes the stored file from S3. If deletion fails, an {@link IOException}
     * is thrown so the caller can react accordingly.
     */
    public static void deleteFile(String key) throws IOException {
        if (key == null || key.isEmpty()) return;
        try {
            ensureAwsCredentials("delete object '" + key + "'");
            DeleteObjectRequest req = DeleteObjectRequest.builder()
                    .bucket(BUCKET)
                    .key(key)
                    .build();
            S3.deleteObject(req);
        } catch (Exception e) {
            log.error("S3 delete failed: {}", e.getMessage());
            throw new IOException("Failed to delete file from S3", e);
        }
    }

    /**
     * Generates a presigned URL for the provided S3 key. If the input already
     * looks like a path or an absolute URL, it is returned unchanged.
     */
    public static String getPublicUrl(String key) {
        if (key == null || key.isEmpty()) return "";
        if (key.startsWith("http://") || key.startsWith("https://")) return key;
        // If an absolute file-system path was persisted (e.g. "/home/ubuntu/uploads/…"),
        // strip the leading directories so the remaining segment can be treated as an
        // S3 object key. This prevents leaking local paths back to clients.
        if (key.startsWith("/")) {
            int idx = key.lastIndexOf('/') + 1;
            key = key.substring(idx);
        }
        try {
            ensureAwsCredentials("generate presigned URL for '" + key + "'");
            GetObjectRequest get = GetObjectRequest.builder()
                    .bucket(BUCKET)
                    .key(key)
                    .build();
            GetObjectPresignRequest presign = GetObjectPresignRequest.builder()
                    .getObjectRequest(get)
                    .signatureDuration(Duration.ofHours(1))
                    .build();
            return PRESIGNER.presignGetObject(presign).url().toString();
        } catch (Exception e) {
            log.warn("Presign failed, returning unsigned URL: {}", e.getMessage());
            return String.format("https://%s.s3.%s.amazonaws.com/%s", BUCKET, REGION.id(), key);
        }
    }
}
