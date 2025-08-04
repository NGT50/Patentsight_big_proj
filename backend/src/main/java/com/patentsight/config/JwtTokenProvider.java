package com.patentsight.config;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtTokenProvider {

    private final Key key = Keys.secretKeyFor(SignatureAlgorithm.HS256); // 랜덤 시크릿 키

    // 토큰 유효기간: 1시간
    private final long validityInMs = 60 * 60 * 1000;

    public String createToken(Long userId, String username, String role) {
        return Jwts.builder()
                .setSubject(username)
                .claim("user_id", userId)
                .claim("role", role)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + validityInMs))
                .signWith(key)
                .compact();
    }
}