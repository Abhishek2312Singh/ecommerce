package com.smartparkhub.backend.dto;

import com.smartparkhub.backend.enums.Role;
import com.smartparkhub.backend.enums.VehicleType;
import lombok.Data;

/** Used for PUT /admin/users/:id and PUT /superadmin/admins/:id — partial update (null = skip) */
@Data
public class UpdateUserRequestDto {
    private String name;
    private String email;
    private Role role;
    private String campus;
    private String batch;
    private String collegeId;
    private String license;
    private String vehicle;
    private VehicleType vehicleType;
    private String vehicleName;
    private String vehicleImage;
}
