package com.patentsight.backend.service;

import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.PutObjectRequest;
import com.amazonaws.services.s3.model.S3Object;
import com.amazonaws.services.s3.model.S3ObjectInputStream;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.UUID;

@Service
public class S3Service {

    @Autowired
    private AmazonS3 amazonS3;

    @Value("${aws.s3.bucket-name}")
    private String bucketName;

    public String uploadFile(MultipartFile file, String folder) {
        try {
            // 파일 확장자 추출
            String originalFilename = file.getOriginalFilename();
            String fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
            
            // 고유한 파일명 생성
            String fileName = folder + "/" + UUID.randomUUID().toString() + fileExtension;
            
            // 임시 파일 생성
            File tempFile = convertMultiPartToFile(file);
            
            // S3에 업로드
            amazonS3.putObject(new PutObjectRequest(bucketName, fileName, tempFile));
            
            // 임시 파일 삭제
            tempFile.delete();
            
            // S3 URL 반환
            return amazonS3.getUrl(bucketName, fileName).toString();
            
        } catch (Exception e) {
            throw new RuntimeException("파일 업로드 실패: " + e.getMessage());
        }
    }

    public byte[] downloadFile(String fileName) {
        try {
            S3Object s3Object = amazonS3.getObject(bucketName, fileName);
            S3ObjectInputStream inputStream = s3Object.getObjectContent();
            
            return inputStream.readAllBytes();
        } catch (IOException e) {
            throw new RuntimeException("파일 다운로드 실패: " + e.getMessage());
        }
    }

    public void deleteFile(String fileName) {
        try {
            amazonS3.deleteObject(bucketName, fileName);
        } catch (Exception e) {
            throw new RuntimeException("파일 삭제 실패: " + e.getMessage());
        }
    }

    private File convertMultiPartToFile(MultipartFile file) throws IOException {
        File convertedFile = new File(file.getOriginalFilename());
        try (FileOutputStream fos = new FileOutputStream(convertedFile)) {
            fos.write(file.getBytes());
        }
        return convertedFile;
    }
} 