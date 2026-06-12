package com.smartparkhub.backend.dto;

import lombok.Data;

@Data
public class LoginResponseDto {
    private String token;
    private Long id;
    private String name;
    private String email;
    private String role;
    private String campus;

    public LoginResponseDto(
            String token,
            Long id,
            String name,
            String email,
            String role,
            String campus) {

        this.token = token;
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
        this.campus = campus;
    }
}
