package com.matador.app.service.validators;

import com.matador.app.domain.ValidationResult;
import com.matador.app.entity.UserProfile;
import com.matador.app.repository.UserProfileRepository;
import org.springframework.stereotype.Component;

import java.util.Optional;

/**
 * Validates user existence and active status for order operations.
 * Checks that:
 * - User ID is provided
 * - User exists in the database
 * - User account is not deleted/inactive
 */
@Component
public class UserValidator {

    private final UserProfileRepository userProfileRepository;

    public UserValidator(UserProfileRepository userProfileRepository) {
        this.userProfileRepository = userProfileRepository;
    }

    /**
     * Validates that the user exists and is active
     * @param userId the user ID to validate
     * @return ValidationResult with user if valid, error message if invalid
     */
    public ValidationResult validate(Integer userId) {
        if (userId == null) {
            return ValidationResult.invalid("User ID is required");
        }

        Optional<UserProfile> user = userProfileRepository.findById(userId);
        if (user.isEmpty()) {
            return ValidationResult.invalid("User not found");
        }

        if (user.get().getDeletedAt() != null) {
            return ValidationResult.invalid("User account is inactive");
        }

        return ValidationResult.valid();
    }

    /**
     * Retrieves a valid user by ID (after validation)
     * @param userId the user ID
     * @return the UserProfile if valid
     */
    public UserProfile getValidUser(Integer userId) {
        return userProfileRepository.findById(userId).orElseThrow(
            () -> new IllegalStateException("User validation should have been checked before calling this method")
        );
    }
}
