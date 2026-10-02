package com.matador.app.dto;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record UpdateUserRequest(
    @NotBlank
    String fname,
    @NotBlank
    String lname,
    @NotBlank
    String email,
    @NotBlank @Pattern(regexp = "^[0-9()+\\-\\s]{7,15}$")
    String phone
) {
}