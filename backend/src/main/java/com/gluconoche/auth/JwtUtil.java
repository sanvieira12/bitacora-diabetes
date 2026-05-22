package com.gluconoche.auth;

import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiry-seconds}")
    private long expirySeconds;

    private SecretKey getKey() {
        byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        if (keyBytes.length < 32) {
            throw new IllegalStateException("JWT_SECRET must be at least 32 characters");
        }
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateToken() {
        long nowMs = System.currentTimeMillis();
        return Jwts.builder()
                .subject("juana")
                .issuedAt(new Date(nowMs))
                .expiration(new Date(nowMs + expirySeconds * 1000))
                .signWith(getKey())
                .compact();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser().verifyWith(getKey()).build().parseSignedClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}
