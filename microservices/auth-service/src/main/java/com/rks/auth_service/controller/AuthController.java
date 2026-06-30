package com.rks.auth_service.controller;

import com.rks.auth_service.dto.requestDto.LoginRequest;
import com.rks.auth_service.dto.responseDto.UserResponse;
import com.rks.auth_service.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    private AuthService authService;
    @PostMapping("/public/login")
    public ResponseEntity<?> loginController(@RequestBody LoginRequest loginRequest){
        System.out.println("Abhishek Singh");
        ResponseEntity<?> response = authService.getUserDetails(loginRequest);
        if(response.getStatusCode().is2xxSuccessful()){
            return ResponseEntity.ok(response.getBody());
        }
        return response;
    }
}
