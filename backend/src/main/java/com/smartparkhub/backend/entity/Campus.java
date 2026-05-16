package com.smartparkhub.backend.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Campus {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String location;
    private Integer totalSlots;

    /** Short slug used as foreign key in User.campus (e.g. "main", "north") */
    @Column(unique = true)
    private String campusKey;
}
