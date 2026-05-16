package com.smartparkhub.backend.dto;

import lombok.Data;

/** Used for PUT /users/:id/change-password — user changes their own password */
@Data
public class ChangePasswordDto {
    private String oldPassword;
    private String newPassword;
}
