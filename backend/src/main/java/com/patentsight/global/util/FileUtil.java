package com.patentsight.global.util;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
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
 * Utility helpers for storing uploaded files. The primary storage target is
 * Amazon S3, but if AWS credentials are not configured or an upload/delete
 * operation fails, the file system under the {@code uploads} directory is used
 * as a graceful fallback so the application can continue to function in local
 * environments.
 */
public class FileUtil {

    private static final Logger log = LoggerFactory.getLogger(FileUtil.class);

    // Default bucket where files are stored. Mirrors the public bucket used by the frontend.
    private static final String BUCKET =
            System.getenv().getOrDefault("S3_BUCKET", "patentsight-artifacts-use1");
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

    // Local fallback directory for environments without S3 credentials
    private static final Path BASE_DIR = Path.of("uploads");

    private static void ensureAwsCredentials(String action) throws IOException {
        try {
            DefaultCredentialsProvider.create().resolveCredentials();
        } catch (SdkClientException e) {
            log.warn("AWS credentials not configured; cannot {}", action);
            throw new IOException(e.getMessage(), e);
        }
    }

    /**
     * Saves the provided multipart file to S3. If credentials are missing or the
     * upload fails, the file is stored on the local file system instead and the
     * absolute path is returned.
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
            // Fall back to local file system
            log.warn("S3 upload failed, storing file locally: {}", e.getMessage());
            Files.createDirectories(BASE_DIR);
            Path target = BASE_DIR.resolve(name).toAbsolutePath();
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
            return target.toString();
        }
    }

    /**
     * Removes the stored file. Attempts S3 deletion first and falls back to
     * deleting a local file if S3 interaction fails.
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
            log.warn("S3 delete failed, removing local file: {}", e.getMessage());
            try {
                Files.deleteIfExists(Path.of(key));
            } catch (IOException ex) {
                log.warn("Failed to delete local file '{}': {}", key, ex.getMessage());
            }
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
