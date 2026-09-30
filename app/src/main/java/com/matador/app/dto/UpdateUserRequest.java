package com.matador.app.dto;
import jakarta.validation.constraints.NotBlank;

public record UpdateUserRequest(
    @NotBlank
    String fname,
    @NotBlank
    String lname,
    @NotBlank
    String email,
    @NotBlank
    String password,
    @NotBlank
    String phone
) {
}