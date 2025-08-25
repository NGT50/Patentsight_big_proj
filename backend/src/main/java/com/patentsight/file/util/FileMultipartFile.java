package com.patentsight.file.util;

import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;

/**
 * Simple {@link MultipartFile} implementation backed by a {@link File}.
 */
public class FileMultipartFile implements MultipartFile {

    private final File file;
    private final String contentType;

    public FileMultipartFile(File file, String contentType) {
        this.file = file;
        this.contentType = contentType;
    }

    @Override
    public String getName() {
        return file.getName();
    }

    @Override
    public String getOriginalFilename() {
        return file.getName();
    }

    @Override
    public String getContentType() {
        return contentType;
    }

    @Override
    public boolean isEmpty() {
        return file.length() == 0;
    }

    @Override
    public long getSize() {
        return file.length();
    }

    @Override
    public byte[] getBytes() throws IOException {
        return Files.readAllBytes(file.toPath());
    }

    @Override
    public InputStream getInputStream() throws IOException {
        return new FileInputStream(file);
    }

    @Override
    public void transferTo(File dest) throws IOException {
        Files.copy(file.toPath(), dest.toPath());
    }
}
