package com.matador.app.service;

import com.matador.app.entity.UserProfile;
import com.matador.app.repository.UserProfileRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserProfileService {

    private UserProfileRepository userProfileRepository;
    private PasswordEncoder passwordEncoder;

    public UserProfileService(UserProfileRepository userProfileRepository, PasswordEncoder passwordEncoder) {
        this.userProfileRepository = userProfileRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public Optional<UserProfile> findByEmail(String email) {
        return userProfileRepository.findByEmail(email);
    }

    public UserProfile register(UserProfile userProfile) {
        // Hash password before saving
        userProfile.setPasswordHash(
            passwordEncoder.encode(userProfile.getPasswordHash())
        );
        return userProfileRepository.save(userProfile);
    }

    public UserProfile findById(Integer userId) {
        return userProfileRepository.findById(userId).orElse(null);
    }
}