package com.matador.app.service;
import com.matador.app.dto.ChangePasswordRequest;
import java.util.NoSuchElementException;

import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.matador.app.repository.UserProfileRepository;
import com.matador.app.dto.UpdateUserRequest;
import com.matador.app.entity.UserProfile;


@Service
public class UpdateUserService {

    private final UserProfileRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UpdateUserService(UserProfileRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public void updateUserInfo(UpdateUserRequest request, int id) {

        UserProfile user = userRepository.findById(id).orElseThrow(() -> new NoSuchElementException("User not found"));
        user.setFirstName(request.fname().trim());
        user.setLastName(request.lname().trim());
        user.setEmail(request.email().trim());
        user.setPhone(request.phone().trim());
        userRepository.save(user);
    }

    public void changePassword(int id, ChangePasswordRequest request) {
        UserProfile user = userRepository.findById(id).orElseThrow(() -> new NoSuchElementException("User not found"));
        if (!checkCurrentPassword(user, request)) {
            throw new IllegalArgumentException("Inputted password does not match the current password");
        }
        user.setPasswordHash(passwordEncoder.encode(request.newPassword())); 
        userRepository.save(user);
    }

    public boolean checkCurrentPassword(UserProfile user, ChangePasswordRequest request) {
        return passwordEncoder.matches(request.currentPassword(), user.getPasswordHash());
    }
}
