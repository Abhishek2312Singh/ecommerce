package com.ecom.rks.controller;

import com.ecom.rks.dto.requestDto.LoginRequest;
import com.ecom.rks.dto.responseDto.UserResponse;
import com.ecom.rks.service.UserService;
import com.ecom.rks.utils.JWTUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class AuthController {
    @Autowired
    private UserService userService;
    @Autowired
    private JWTUtil jwtUtil;
    @Autowired
    private AuthenticationManager authenticationManager;
    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody LoginRequest loginRequest){
        try{
            authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(
                    loginRequest.getEmail(),
                    loginRequest.getPassword()));
            UserResponse user = userService.getUser(loginRequest.getEmail());
            return ResponseEntity.ok(jwtUtil.generateToken(user));
        }catch (Exception e){
            System.out.println("Login Error : " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
