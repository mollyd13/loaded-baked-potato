package com.matador.app.controller;
import org.springframework.stereotype.Controller;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.matador.app.dto.UpdateUserRequest;

@RestController
@RequestMapping("/users")
public class UserController {

    public UserController() {

    }

    @PatchMapping
    public ResponseEntity<String> updateUser(@Valid @RequestBody UpdateUserRequest request) {
        return ResponseEntity.ok("User updated successfully");
    }
    
}
