package com.patentsight.global.util;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;

class FileUtilTest {
    @Test
    void convertsLocalHttpUrlToS3Path() {
        String result = FileUtil.getPublicUrl("http://localhost/home/ubuntu/uploads/test.png");
        assertTrue(result.endsWith("test.png"));
        assertTrue(result.contains("patentsight-artifacts-usea1"));
    }

    @Test
    void returnsS3UrlUnchanged() {
        String s3 = "https://patentsight-artifacts-usea1.s3.us-east-1.amazonaws.com/test.png";
        assertEquals(s3, FileUtil.getPublicUrl(s3));
    }
}
