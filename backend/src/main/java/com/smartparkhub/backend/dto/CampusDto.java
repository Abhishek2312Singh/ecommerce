package com.smartparkhub.backend.dto;

import lombok.Data;

@Data
public class CampusDto {
    private String name;
    private String location;
    private Integer totalSlots;
    /** Optional — auto-derived from name if not supplied */
    private String campusKey;
}
