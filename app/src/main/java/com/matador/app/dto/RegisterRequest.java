package com.matador.app.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
    @NotBlank String firstName,
    @NotBlank String lastName,
    @NotBlank @Email String email,
    @NotBlank @Pattern(regexp = "^[0-9()+\\-\\s]{7,15}$") String phone,
    @NotBlank @Size(min = 8, max = 72) String password
) {
}
