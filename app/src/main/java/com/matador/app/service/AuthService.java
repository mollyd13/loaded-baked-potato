package com.matador.app.service;

import com.matador.app.dto.RegisterRequest;
import com.matador.app.entity.UserProfile;
import com.matador.app.exception.DuplicateUserException;
import com.matador.app.repository.UserProfileRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Locale;

@Service
public class AuthService {

    public static final String DEFAULT_ROLE = "USER";

    private final UserProfileRepository userProfileRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserProfileRepository userProfileRepository, PasswordEncoder passwordEncoder) {
        this.userProfileRepository = userProfileRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public UserProfile register(RegisterRequest request) {
        String email = normalizeEmail(request.email());
        String phone = request.phone().trim();

        if (userProfileRepository.findByEmail(email).isPresent()) {
            throw new DuplicateUserException("An account with this email already exists");
        }
        if (userProfileRepository.findByPhone(phone).isPresent()) {
            throw new DuplicateUserException("An account with this phone number already exists");
        }

        // Never store the raw password, only its BCrypt hash
        UserProfile user = new UserProfile(
            request.firstName().trim(),
            request.lastName().trim(),
            email,
            passwordEncoder.encode(request.password()),
            phone,
            DEFAULT_ROLE,
            LocalDateTime.now()
        );
        return userProfileRepository.save(user);
    }

    @Transactional(readOnly = true)
    public UserProfile findActiveByEmail(String email) {
        return userProfileRepository.findByEmail(normalizeEmail(email))
            .filter(u -> u.getDeletedAt() == null)
            .orElseThrow(() -> new IllegalStateException("Authenticated user no longer exists"));
    }

    public static String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}
