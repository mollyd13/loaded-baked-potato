package com.matador.app.dto;

import com.matador.app.entity.UserProfile;

public record UserResponse(
    Integer userId,
    String firstName,
    String lastName,
    String email,
    String phone,
    String roleType
) {
    public static UserResponse from(UserProfile user) {
        return new UserResponse(
            user.getUserId(),
            user.getFirstName(),
            user.getLastName(),
            user.getEmail(),
            user.getPhone(),
            user.getRoleType()
        );
    }
}
