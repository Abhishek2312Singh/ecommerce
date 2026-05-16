package com.smartparkhub.backend.entity;

import com.smartparkhub.backend.enums.SlotType;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Slot {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String zone;

    @Enumerated(EnumType.STRING)
    private SlotType type;

    private Boolean occupied;

    /** Campus slug this slot belongs to (e.g. "main", "north") */
    private String campusKey;
}
