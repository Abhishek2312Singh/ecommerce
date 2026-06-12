package com.smartparkhub.backend.dto;

import com.smartparkhub.backend.enums.Role;
import com.smartparkhub.backend.enums.VehicleType;
import lombok.Data;

@Data
public class CreateUserRequestDto {
    private String name;
    private String fatherName;
    private String email;
    private String mobileNo;
    private Role role;
    private String campus;
    private String batch;
    private String collegeId;
    private String license;
    private String vehicle;
    private String password;
    private VehicleType vehicleType;
    private String vehicleName;
    private String vehicleColor;
    private String vehicleModel;
    private String vehicleImage;
}
