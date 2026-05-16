package com.smartparkhub.backend.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
public class ParkingRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    private String userName;
    private String userEmail;
    private String userRole;
    private String campus;
    private Long slotId;
    private String zone;
    private String vehicleNo;

    @Column(nullable = false)
    private LocalDateTime entryTime;

    private LocalDateTime exitTime;
}
