package com.smartparkhub.backend.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

/**
 * Utility class for generating and validating JWT tokens.
 * Claims embedded: userId, email, role, campus
 */
@Component
public class JwtUtil {

    @Value("${app.jwt.secret}")
    private String secret;

    @Value("${app.jwt.expiration-ms}")
    private long expirationMs;

    private SecretKey getSigningKey() {
        byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    /** Generate a signed JWT containing user claims */
    public String generateToken(long userId, String email, String role, String campus) {
        return Jwts.builder()
                .subject(email)                          // standard "sub" claim
                .claim("userId", userId)                 // custom claims added one by one
                .claim("role",   role)                   // so subject is NOT overwritten
                .claim("campus", campus != null ? campus : "")
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expirationMs))
                .signWith(getSigningKey())
                .compact();
    }

    /** Parse and validate a JWT token, returning its Claims */
    public Claims validateAndGetClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public String extractEmail(String token) {
        return validateAndGetClaims(token).getSubject();
    }

    public String extractRole(String token) {
        return (String) validateAndGetClaims(token).get("role");
    }

    public String extractCampus(String token) {
        return (String) validateAndGetClaims(token).get("campus");
    }

    public Long extractUserId(String token) {
        Object id = validateAndGetClaims(token).get("userId");
        if (id instanceof Integer) return ((Integer) id).longValue();
        if (id instanceof Long)    return (Long) id;
        return null;
    }

    public boolean isTokenValid(String token) {
        try {
            validateAndGetClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}
