package com.rks.auth_service.service;

import com.rks.auth_service.dto.requestDto.LoginRequest;
import com.rks.auth_service.dto.responseDto.UserResponse;
import com.rks.auth_service.utils.JWTUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class AuthService {
    @Autowired
    private JWTUtil util;

    @Autowired
    private RestTemplate rest;
    public ResponseEntity<?> getUserDetails(LoginRequest loginRequest) {
        String url = "http://localhost:8083/api/user/public/login";
        HttpEntity<LoginRequest> entity = new HttpEntity<>(loginRequest);
        try {
            ResponseEntity<UserResponse> response = rest.exchange(
                    url,
                    HttpMethod.POST,
                    entity,
                    UserResponse.class
            );
            System.out.println("User Response : " + response.getBody());
            String token = util.generateToken(response.getBody());
            return ResponseEntity.ok(token);
        }catch (Exception e){
            System.out.println(e.getMessage());
         return ResponseEntity.badRequest().body("User not found");
        }
    }
}
