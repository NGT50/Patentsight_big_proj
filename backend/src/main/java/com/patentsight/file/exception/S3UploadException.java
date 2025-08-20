package com.patentsight.file.exception;

/**
 * Exception thrown when a file cannot be uploaded or updated in the underlying
 * storage such as AWS S3. The original error message is preserved to aid
 * debugging of storage-related issues.
 */
public class S3UploadException extends RuntimeException {

    public S3UploadException(String message, Throwable cause) {
        super(message, cause);
    }
}

