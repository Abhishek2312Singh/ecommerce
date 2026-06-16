package com.smartparkhub.backend.entity;

import com.smartparkhub.backend.enums.Role;
import com.smartparkhub.backend.enums.VehicleType;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String email;

    @Enumerated(EnumType.STRING)
    private Role role;

    private String campus;
    private String batch;
    private String collegeId;
    private String license;
    private String vehicle;
    private String password;

    @Enumerated(EnumType.STRING)
    private VehicleType vehicleType;

    private String vehicleName;
    private String vehicleImage;

    /**
     * Temporary self-reported parking state.
     * Users manually toggle this until QR/gate scanning is implemented.
     * true = currently parked, false = not parked (default).
     */
    @Column(nullable = false, columnDefinition = "BOOLEAN DEFAULT FALSE")
    private Boolean isParked = false;
}
