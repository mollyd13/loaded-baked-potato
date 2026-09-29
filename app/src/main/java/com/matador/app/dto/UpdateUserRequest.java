package com.matador.app.dto;
import jakarta.validation.constraints.NotBlank;

public record UpdateUserRequest(
    @NotBlank
    String field,
    @NotBlank 
    String newValue
) {
}