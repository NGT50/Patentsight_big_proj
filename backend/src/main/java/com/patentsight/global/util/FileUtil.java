package com.patentsight.global.util;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.nio.file.Files;
import java.nio.file.Path;
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
import software.amazon.awssdk.services.s3.model.S3Exception;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;

import java.time.Duration;

/**
 * Utility helpers for storing uploaded files in Amazon S3. The methods throw
 * {@link IOException} when AWS credentials are missing or an S3 operation
 * fails.
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
     * Saves the provided multipart file to S3 and returns its key. An
     * {@link IOException} is thrown if credentials are missing or the upload
     * fails.
     */
    public static String saveFile(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IOException("No file provided");
        }
        String name = UUID.randomUUID() + "_" + file.getOriginalFilename();
        ensureAwsCredentials("upload file '" + file.getOriginalFilename() + "'");
        try {
            PutObjectRequest req = PutObjectRequest.builder()
                    .bucket(BUCKET)
                    .key(name)
                    .contentType(file.getContentType())
                    .build();
            S3.putObject(req, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
            return name;
        } catch (S3Exception | SdkClientException e) {
            throw new IOException("S3 upload failed: " + e.getMessage(), e);
        }
    }

    /**
     * Removes the stored file from S3. An {@link IOException} is thrown if the
     * deletion fails.
     */
    public static void deleteFile(String key) throws IOException {
        if (key == null || key.isEmpty()) return;
        ensureAwsCredentials("delete object '" + key + "'");
        try {
            DeleteObjectRequest req = DeleteObjectRequest.builder()
                    .bucket(BUCKET)
                    .key(key)
                    .build();
            S3.deleteObject(req);
        } catch (S3Exception | SdkClientException e) {
            throw new IOException("S3 delete failed: " + e.getMessage(), e);
        }
    }

    /**
     * Downloads the file for the given key or URL and returns its bytes. If the
     * input refers to a local file path it will be read directly; otherwise an
     * S3 getObject call is made.
     */
    public static byte[] downloadFile(String key) throws IOException {
        if (key == null || key.isEmpty()) {
            throw new IOException("No file key provided");
        }
        if (key.startsWith("http://") || key.startsWith("https://")) {
            try (InputStream in = URI.create(key).toURL().openStream()) {
                return in.readAllBytes();
            }
        }
        Path path = Path.of(key);
        if (Files.exists(path)) {
            return Files.readAllBytes(path);
        }
        ensureAwsCredentials("download object '" + key + "'");
        try {
            GetObjectRequest req = GetObjectRequest.builder()
                    .bucket(BUCKET)
                    .key(key)
                    .build();
            return S3.getObjectAsBytes(req).asByteArray();
        } catch (S3Exception | SdkClientException e) {
            throw new IOException("S3 download failed: " + e.getMessage(), e);
        }
    }

    /**
     * Generates a presigned URL for the provided S3 key. If the input already
     * looks like a path or an absolute URL, it is returned unchanged.
     */
    public static String getPublicUrl(String key) {
        if (key == null || key.isEmpty()) return "";
        if (key.startsWith("http://") || key.startsWith("https://")) return key;
        if (key.startsWith("/")) return key;
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
