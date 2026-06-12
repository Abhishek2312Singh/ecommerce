package com.smartparkhub.backend.controller;

import com.smartparkhub.backend.dto.ChangePasswordDto;
import com.smartparkhub.backend.dto.LoginRequestDto;
import com.smartparkhub.backend.dto.LoginResponseDto;
import com.smartparkhub.backend.entity.ParkingRecord;
import com.smartparkhub.backend.entity.Slot;
import com.smartparkhub.backend.entity.User;
import com.smartparkhub.backend.repository.ParkingRecordRepo;
import com.smartparkhub.backend.repository.SlotRepo;
import com.smartparkhub.backend.repository.UserRepo;
import com.smartparkhub.backend.security.JwtUtil;
import com.smartparkhub.backend.service.AuthService;
import com.smartparkhub.backend.service.ParkingService;
import com.smartparkhub.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
public class UserController {

    @Autowired private AuthService authService;
    @Autowired private UserRepo userRepo;
    @Autowired private UserService userService;
    @Autowired private SlotRepo slotRepo;
    @Autowired private ParkingService parkingService;
    @Autowired private ParkingRecordRepo parkingRecordRepo;
    @Autowired private JwtUtil  jwtUtil;


    @PostMapping("/login")
    public ResponseEntity<LoginResponseDto> login(
            @RequestBody LoginRequestDto dto) {

        LoginResponseDto response = authService.login(dto);

        System.out.println("RETURNING RESPONSE");

        return ResponseEntity.ok(response);
    }

    @PutMapping("/users/{id}/change-password")
    public ResponseEntity<String> changePassword(
            @PathVariable Long id,
            @RequestBody ChangePasswordDto dto,
            Authentication auth) {

        userService.changePassword(id, dto, auth);

        return ResponseEntity.ok(
                "Password changed successfully");
    }


    @PutMapping("/users/{id}/toggle-parking")
    public ResponseEntity<Map<String, Object>>
    toggleParking(
            @PathVariable Long id,
            Authentication auth) {

        return ResponseEntity.ok(
                parkingService.toggleParking(
                        id,
                        auth));
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<Map<String, Object>> getUser(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                userService.getUser(id));
    }
}
