package com.rks.userservice.utils;

import com.rks.userservice.dto.responseDto.UserResponse;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JWTUtil {
    private final String SECRETKEY = "K8mP2xR9vT4qW7yN1cF6hJ3kL8zX5bD2sA9eG4rY7uI1oP6";
    private final SecretKey KEY = Keys.hmacShaKeyFor(SECRETKEY.getBytes());
    public String generateToken(UserResponse user){
        return Jwts.builder()
                .subject(user.getEmail())
                .claim("role",user.getRole())
                .claim("username",user.getFullName())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() * 1000 * 60 + 30))
                .signWith(KEY)
                .compact();
    }

    public Claims getClaims(String token) {
        Claims body = Jwts.parser()
                .verifyWith(KEY)
                .build()
                .parseSignedClaims(token)
                .getPayload();
        return body;
    }
}
