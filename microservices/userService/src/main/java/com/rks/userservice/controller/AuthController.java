package com.rks.userservice.controller;

import com.rks.userservice.dto.requestDto.LoginRequest;
import com.rks.userservice.dto.responseDto.UserResponse;
import com.rks.userservice.service.UserService;
import com.rks.userservice.utils.JWTUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/user")
public class AuthController {
    @Autowired
    private UserService userService;
    @Autowired
    private JWTUtil jwtUtil;
    @Autowired
    private AuthenticationManager authenticationManager;
    @PostMapping("/public/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest){
        System.out.println("Login Controller Called");
        try{
            authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(
                    loginRequest.getEmail(),
                    loginRequest.getPassword()));
            UserResponse user = userService.getUser(loginRequest.getEmail());
            return ResponseEntity.ok(user);
        }catch (Exception e){
            System.out.println("Login Error : " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
