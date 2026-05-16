package com.smartparkhub.backend.dto;

import lombok.Data;

/** Used for PUT /admin/users/:id/reset-password — admin resets a user's password */
@Data
public class PasswordResetDto {
    private String newPassword;
}
