package com.patentsight.global.util;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

/**
 * Utility helpers for storing uploaded files. The implementation keeps files
 * on the local file system under the {@code uploads} directory which makes it
 * easy to run the application locally. In production the returned path can be
 * used as an S3 object key after swapping the implementation.
 */
public class FileUtil {

    private static final Path BASE_DIR = Path.of("uploads");

    /**
     * Saves the provided multipart file to disk and returns the absolute
     * path. Directories are created as necessary.
     */
    public static String saveFile(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IOException("No file provided");
        }
        Files.createDirectories(BASE_DIR);
        String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Path target = BASE_DIR.resolve(filename).toAbsolutePath();
        Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
        return target.toString();
    }

    /**
     * Removes the file at the given path if it exists. This is used when a
     * {@link com.patentsight.file.domain.FileAttachment} is deleted or
     * replaced.
     */
    public static void deleteFile(String path) throws IOException {
        if (path != null) {
            Files.deleteIfExists(Path.of(path));
        }
    }
}
