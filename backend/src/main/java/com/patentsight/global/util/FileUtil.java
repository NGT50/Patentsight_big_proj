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

/**
 * Utility helpers for storing uploaded files. The primary storage target is
 * Amazon S3, but if AWS credentials are not configured or an upload/delete
 * operation fails, the file system under the {@code uploads} directory is used
 * as a graceful fallback so the application can continue to function in local
 * environments.
 */
public class FileUtil {

    private static final Logger log = LoggerFactory.getLogger(FileUtil.class);

    private static final String BUCKET = System.getenv().getOrDefault("S3_BUCKET", "patentsight-artifacts-usea1");
    private static final Region REGION = Region.of(System.getenv().getOrDefault("AWS_REGION", "us-east-1"));
    private static final S3Client S3 = S3Client.builder().region(REGION).build();

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
}
