package com.smartparkhub.backend.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
public class VisitorPass {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String passCode;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String campus;

    @Column(nullable = false)
    private String vehicleNo;

    @Column(nullable = false)
    private String purpose;

    private String host;
    private String issuedBy;

    @Column(nullable = false)
    private LocalDateTime issuedAt;

    @Column(nullable = false)
    private LocalDateTime expiresAt;
}
