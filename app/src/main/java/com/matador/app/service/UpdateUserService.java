package com.matador.app.service;

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

    public void updateUser(UpdateUserRequest request, int id) {

        UserProfile user = userRepository.findById(id).orElseThrow(() -> new NoSuchElementException("User not found"));
        user.setFirstName(request.fname().trim());
        user.setLastName(request.lname().trim());
        user.setEmail(request.email().trim());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setPhone(request.phone().trim());
        userRepository.save(user);
    }
}
