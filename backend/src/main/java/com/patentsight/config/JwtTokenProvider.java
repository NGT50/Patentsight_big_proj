package com.patentsight.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
 
@Component
public class JwtTokenProvider {

    private final SecretKey key;
    private final long validityInMs;

    public JwtTokenProvider(
            @Value("${security.jwt.secret}") String secret,
            @Value("${security.jwt-validity-ms:86400000}") long validityInMs // 24h 기본값
    ) {
        // 서버 재시작해도 동일한 비밀키 사용
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.validityInMs = validityInMs;
    }

    /** 로그인 시 토큰 발급 */
    public String createToken(Long userId, String username, String role) {
        Date now = new Date();
        Date exp = new Date(now.getTime() + validityInMs);

        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", userId); // 본인 확인에 사용
        claims.put("role", role);     // "EXAMINER", "ADMIN" 등

        return Jwts.builder()
                .setSubject(username)         // sub
                .addClaims(claims)            // 커스텀 클레임
                .setIssuedAt(now)             // iat
                .setExpiration(exp)           // exp
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    /** Authorization 헤더에서 userId 추출 (컨트롤러에서 쓰던 시그니처 유지) */
    public Long getUserIdFromHeader(String authorizationHeader) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            return null;
        }
        String token = authorizationHeader.substring(7);
        return getUserIdFromToken(token);
    }

    /** 토큰에서 userId 추출 */
    public Long getUserIdFromToken(String token) {
        Claims claims = parseClaims(token);
        Number n = claims.get("userId", Number.class);
        return (n == null) ? null : n.longValue();
    }

    /** 토큰에서 username(sub) 추출 (필요 시 컨트롤러에서 사용) */
    public String getUsernameFromToken(String token) {
        return parseClaims(token).getSubject();
    }

    /** 토큰 유효성 검사 */
    public boolean validateToken(String token) {
        try {
            Claims claims = parseClaims(token);
            return claims.getExpiration() == null || claims.getExpiration().after(new Date());
        } catch (Exception e) {
            return false;
        }
    }

    private Claims parseClaims(String token) {
        Jws<Claims> jws = Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token);
        return jws.getBody();
    }
}
