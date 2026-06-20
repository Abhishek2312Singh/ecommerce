package com.ecom.rks.entity;

import com.ecom.rks.enums.Roles;
import jakarta.persistence.*;

@Entity
public class Role {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;
    @Enumerated(EnumType.STRING)
    private Roles role;
}
