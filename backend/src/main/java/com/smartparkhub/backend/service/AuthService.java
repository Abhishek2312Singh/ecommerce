package com.smartparkhub.backend.service;

import com.smartparkhub.backend.dto.LoginRequestDto;
import com.smartparkhub.backend.dto.LoginResponseDto;
import com.smartparkhub.backend.entity.User;
import com.smartparkhub.backend.repository.UserRepo;
import com.smartparkhub.backend.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class AuthService {
    @Autowired
    private UserRepo userRepo;

    @Autowired
    private JwtUtil jwtUtil;

    public LoginResponseDto login(LoginRequestDto dto){
        System.out.println("EMAIL = " + dto.getEmail());
        System.out.println("PASSWORD = " + dto.getPassword());
        User user = userRepo.findByEmail(dto.getEmail())
                .orElseThrow(() ->
                        new RuntimeException("Invalid email or password"));

        if (!user.getPassword().equals(dto.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        String token = jwtUtil.generateToken(
                user.getId(),
                user.getEmail(),
                user.getRole() != null ? user.getRole().name() : "STUDENT",
                user.getCampus()
        );

        return new LoginResponseDto(
                token,
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole().name(),
                user.getCampus()
        );
    }
}
