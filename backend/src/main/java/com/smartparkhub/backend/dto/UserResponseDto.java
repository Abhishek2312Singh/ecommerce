package com.smartparkhub.backend.dto;

import com.smartparkhub.backend.enums.Role;
import lombok.Data;

@Data
public class UserResponseDto {
    private String name;
    private Role role;
    private String license;
    private String vehicle;
}
